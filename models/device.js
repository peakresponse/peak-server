const sequelizePaginate = require('sequelize-paginate');
const nemsis = require('../lib/nemsis');
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
      validate: {
        async schema() {
          this.validationError = await nemsis.validateSchema('dDevice_v3.xsd', 'dDevice', 'dDevice.DeviceGroup', this.data);
          if (this.validationError) throw this.validationError;
        },
      },
    }
  );

  Device.beforeSave(async (record) => {
    if (!record.id) {
      record.setDataValue('id', record.data?._attributes?.UUID);
    }
    record.setDataValue('serialNumber', record.data?.['dDevice.01']?._text);
    record.setDataValue('name', record.data?.['dDevice.02']?._text);
    record.setDataValue('primaryType', Base.firstValueOf(record.data?.['dDevice.03']));
    record.setDataValue('isValid', record.data?._attributes?.['pr:isValid']);
  });

  sequelizePaginate.paginate(Device);

  return Device;
};
