const sequelizePaginate = require('sequelize-paginate');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Device extends Base {
    static get xsdPath() {
      return 'dDevice_v3.xsd';
    }

    static get rootTag() {
      return 'dDevice';
    }

    static get groupTag() {
      return 'dDevice.DeviceGroup';
    }

    static associate(models) {
      Device.belongsTo(Device, { as: 'draftParent' });
      Device.hasOne(Device, { as: 'draft', foreignKey: 'draftParentId' });
      Device.belongsTo(models.User, { as: 'updatedBy' });
      Device.belongsTo(models.User, { as: 'createdBy' });
      Device.belongsTo(models.Agency, { as: 'createdByAgency' });
      Device.belongsTo(models.Version, { as: 'version' });
    }
  }

  Device.init(
    {
      isDraft: {
        type: DataTypes.BOOLEAN,
      },
      serialNumber: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
      },
      primaryType: {
        type: DataTypes.STRING,
      },
      data: {
        type: DataTypes.JSONB,
      },
      isValid: {
        type: DataTypes.BOOLEAN,
      },
      validationErrors: {
        type: DataTypes.JSONB,
      },
      archivedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: 'Device',
      tableName: 'devices',
      underscored: true,
    },
  );

  Device.addDraftScopes();

  Device.beforeSave(async (record, options) => {
    record.syncNemsisId(options);
    record.syncFieldAndNemsisValue('serialNumber', ['dDevice.01'], options);
    record.syncFieldAndNemsisValue('name', ['dDevice.02'], options);
    record.syncFieldAndNemsisValue('primaryType', ['dDevice.03'], options);
    await record.xsdValidate(options);
  });

  sequelizePaginate.paginate(Device);

  return Device;
};
