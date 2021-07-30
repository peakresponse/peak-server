const _ = require('lodash');
const { Base } = require('./base');

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
      if (data.parentId) {
        // this is updating the parent to create a new version, update canonical record
        // const parent = await Dispatch.findByPk(data.parentId, {transaction: options.transaction, rejectOnEmpty: true});
        // // sanitize the data by picking only the attributes allowed to be updated
        // const filteredData = _.pick(data, [
        //   parentId, dispatchedAt, acknowledgedAt, data
        // ]);
        // // get a list of the updated attributes
        // const updatedAttributes = _.keys(filteredData);
        // create the new historical record
        const record = await Dispatch.findOrBuild({ where: { id: data.id }, transaction: options.transaction });
        // update the canonical record, resolving any merge trees
        return record;
      }
      // find or create the new historical record
      let record = await Dispatch.findByPk(data.id, { transaction: options.transaction });
      if (record) {
        // assume this is a repeated request, handle as idempotent
        return record;
      }
      const filteredData = _.pick(data, ['id', 'canonicalId', 'incidentId', 'vehicleId', 'dispatchedAt', 'acknowledgedAt', 'data']);
      // get a list of the updated attributes
      const updatedAttributes = _.keys(filteredData);
      record = Dispatch.build(filteredData);
      record.updatedAttributes = updatedAttributes;
      record.createdById = user.id;
      record.updatedById = user.id;
      record.createdByAgencyId = agency?.id;
      record.updatedByAgencyId = agency?.id;
      // create the canonical record
      const canonical = Dispatch.build({ ...filteredData, id: data.canonicalId, canonicalId: null });
      canonical.createdById = user.id;
      canonical.updatedById = user.id;
      canonical.createdByAgencyId = agency?.id;
      canonical.updatedByAgencyId = agency?.id;
      await canonical.save({ transaction: options.transaction });
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
    },
    {
      sequelize,
      modelName: 'Dispatch',
      tableName: 'dispatches',
      underscored: true,
    }
  );
  return Dispatch;
};
