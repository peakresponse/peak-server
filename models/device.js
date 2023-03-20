const sequelizePaginate = require('sequelize-paginate');
const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Device extends Base {
    static associate(models) {
      Device.belongsTo(models.User, { as: 'updatedBy' });
      Device.belongsTo(models.User, { as: 'createdBy' });
      Device.belongsTo(models.Agency, { as: 'createdByAgency' });
    }
  }

  Device.init(
    {
      serialNumber: {
        type: DataTypes.STRING,
        field: 'serial_number',
      },
      name: DataTypes.STRING,
      primaryType: {
        type: DataTypes.STRING,
        field: 'primary_type',
      },
      data: DataTypes.JSONB,
      isValid: {
        type: DataTypes.BOOLEAN,
        field: 'is_valid',
      },
    },
    {
      sequelize,
      modelName: 'Device',
      tableName: 'devices',
      underscored: true,
    }
  );

  Device.beforeSave(async (record, options) => {
    record.syncNemsisId(options);
    record.syncFieldAndNemsisValue('serialNumber', ['dDevice.01'], options);
    record.syncFieldAndNemsisValue('name', ['dDevice.02'], options);
    record.syncFieldAndNemsisValue('primaryType', ['dDevice.03'], options);
    await record.validateNemsisData('dDevice_v3.xsd', 'dDevice', 'dDevice.DeviceGroup', options);
  });

  sequelizePaginate.paginate(Device);

  return Device;
};
