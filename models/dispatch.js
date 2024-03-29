const _ = require('lodash');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Dispatch extends Base {
    static get xsdPath() {
      return 'eDispatch_v3.xsd';
    }

    static get rootTag() {
      return 'eDispatch';
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Dispatch.belongsTo(Dispatch, { as: 'canonical' });
      Dispatch.belongsTo(Dispatch, { as: 'current' });
      Dispatch.belongsTo(Dispatch, { as: 'parent' });
      Dispatch.belongsTo(Dispatch, { as: 'secondParent' });
      Dispatch.belongsTo(models.Incident, { as: 'incident' });
      Dispatch.belongsTo(models.Vehicle, { as: 'vehicle' });
      Dispatch.belongsTo(models.User, { as: 'createdBy' });
      Dispatch.belongsTo(models.User, { as: 'updatedBy' });
      Dispatch.belongsTo(models.Agency, { as: 'createdByAgency' });
      Dispatch.belongsTo(models.Agency, { as: 'updatedByAgency' });
    }

    static createOrUpdate(user, agency, data, options) {
      return Base.createOrUpdate(
        Dispatch,
        user,
        agency,
        data,
        ['incidentId', 'vehicleId'],
        ['data', 'dispatchedAt', 'acknowledgedAt'],
        options,
      );
    }

    toJSON() {
      const attributes = { ...this.get() };
      return _.pick(attributes, [
        'id',
        'canonicalId',
        'currentId',
        'parentId',
        'secondParentId',
        'incidentId',
        'vehicleId',
        'dispatchedAt',
        'acknowledgedAt',
        'data',
        'updatedAttributes',
        'updatedDataAttributes',
        'isValid',
        'createdAt',
        'createdById',
        'createdByAgencyId',
        'updatedAt',
        'updatedById',
        'updatedByAgencyId',
      ]);
    }
  }

  Dispatch.init(
    {
      isCanonical: {
        type: DataTypes.VIRTUAL(DataTypes.BOOLEAN, ['canonicalId']),
        get() {
          return !this.canonicalId;
        },
      },
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
    },
  );

  Dispatch.addScope('canonical', {
    where: {
      canonicalId: null,
    },
  });

  Dispatch.afterCreate(async (record, options) => {
    if (record.isCanonical) {
      const { transaction } = options ?? {};
      const incident = await record.getIncident({ transaction });
      await incident.updateDispatchedAgencies({ transaction });
    }
  });

  return Dispatch;
};
