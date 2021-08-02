const jsonDiff = require('json-diff');
const _ = require('lodash');

const { Base } = require('./base');
const nemsis = require('../lib/nemsis');

module.exports = (sequelize, DataTypes) => {
  class Dispatch extends Base {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Dispatch.belongsTo(Dispatch, { as: 'canonical' });
      Dispatch.belongsTo(Dispatch, { as: 'parent' });
      Dispatch.belongsTo(Dispatch, { as: 'secondParent' });
      Dispatch.belongsTo(models.Incident, { as: 'incident' });
      Dispatch.belongsTo(models.Vehicle, { as: 'vehicle' });
      Dispatch.belongsTo(models.User, { as: 'createdBy' });
      Dispatch.belongsTo(models.User, { as: 'updatedBy' });
      Dispatch.belongsTo(models.Agency, { as: 'createdByAgency' });
      Dispatch.belongsTo(models.Agency, { as: 'updatedByAgency' });
    }

    static async createOrUpdate(user, agency, data, options) {
      if (!options?.transaction) {
        return sequelize.transaction((transaction) => Dispatch.createOrUpdate(user, agency, data, { ...options, transaction }));
      }
      // find or create the new historical record
      if (!data.id || (!data.canonicalId && !data.parentId)) {
        throw new Error();
      }
      let record = await Dispatch.findByPk(data.id, { transaction: options.transaction });
      if (record) {
        // assume this is a repeated request, handle as immutable and idempotent
        return record;
      }
      let filteredData;
      let updatedAttributes;
      let updatedDataAttributes;
      let canonical;
      let parent;
      if (data.parentId) {
        // this is updating the parent to create a new version and update canonical record
        parent = await Dispatch.findByPk(data.parentId, { transaction: options.transaction, rejectOnEmpty: true });
        // sanitize the data by picking only the attributes allowed to be updated
        filteredData = _.pick(data, ['id', 'parentId', 'dispatchedAt', 'acknowledgedAt', 'data']);
        // get a list of the updated attributes
        updatedAttributes = _.keys(filteredData);
        // merge the new attributes into the parent attributes
        filteredData = _.assign(parent.get(), filteredData);
        // update the canonical record
        canonical = await Dispatch.findByPk(filteredData.canonicalId, { transaction: options.transaction, rejectOnEmpty: true });
        // TODO - handle merging parallel and out-of-order updates
        canonical.set(_.pick(filteredData, ['dispatchedAt', 'acknowledgedAt', 'data']));
      } else {
        // this is creating an entirely new record
        filteredData = _.pick(data, ['id', 'canonicalId', 'incidentId', 'vehicleId', 'dispatchedAt', 'acknowledgedAt', 'data']);
        updatedAttributes = _.keys(filteredData);
        // set createdBy with this user/agency
        filteredData.createdById = user.id;
        filteredData.createdByAgencyId = agency?.id;
        // create the canonical record
        canonical = Dispatch.build({ ...filteredData, id: data.canonicalId, canonicalId: null });
      }
      // create/update the canonical record
      canonical.updatedById = user.id;
      canonical.updatedByAgencyId = agency?.id;
      await canonical.save({ transaction: options.transaction });
      // create the historical record
      record = Dispatch.build(filteredData);
      record.updatedAttributes = updatedAttributes;
      if (updatedAttributes.includes('data')) {
        const diff = jsonDiff.diff(parent?.data || {}, data.data);
        updatedDataAttributes = _.keys(diff).filter((key) => !key.startsWith('_'));
      }
      record.updatedDataAttributes = updatedDataAttributes;
      record.updatedById = user.id;
      record.updatedByAgencyId = agency?.id;
      await record.save({ transaction: options.transaction });
      return record;
    }
  }

  Dispatch.init(
    {
      dispatchedAt: {
        type: DataTypes.DATE,
        field: 'dispatched_at',
      },
      acknowledgedAt: {
        type: DataTypes.DATE,
        field: 'acknowledged_at',
      },
      data: DataTypes.JSONB,
      updatedAttributes: {
        type: DataTypes.JSONB,
        field: 'updated_attributes',
      },
      updatedDataAttributes: {
        type: DataTypes.JSONB,
        field: 'updated_data_attributes',
      },
      isValid: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      sequelize,
      modelName: 'Dispatch',
      tableName: 'dispatches',
      underscored: true,
      validate: {
        async schema() {
          this.validationError = await nemsis.validateSchema('eDispatch_v3.xsd', 'eDispatch', null, this.data);
        },
      },
    }
  );

  Dispatch.addScope('canonical', {
    where: {
      canonicalId: null,
      parentId: null,
    },
  });

  Dispatch.beforeSave(async (record) => {
    record.setDataValue('isValid', record.getNemsisAttributeValue([], ['pr:isValid']));
  });

  return Dispatch;
};
