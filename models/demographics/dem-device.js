'use strict';

const sequelizePaginate = require('sequelize-paginate')
const nemsis = require('../../lib/nemsis');

module.exports = (sequelize, DataTypes) => {
  const DemDevice = sequelize.define('DemDevice', {
    serialNumber: {
      type: DataTypes.STRING,
      field: 'serial_number',
    },
    name: DataTypes.STRING,
    primaryType: {
      type: DataTypes.STRING,
      field: 'primary_type'
    },
    data: DataTypes.JSONB,
    isValid: {
      type: DataTypes.BOOLEAN,
      field: 'is_valid'
    }
  }, {
    schema: 'demographics',
    tableName: 'devices',
    underscored: true,
    validate: {
      schema: async function() {
        this.validationError = await nemsis.validateSchema('dDevice_v3.xsd', 'dDevice', 'dDevice.DeviceGroup', this.data);
        if (this.validationError) throw this.validationError;
      }
    }
  });
  DemDevice.associate = function(models) {
    DemDevice.belongsTo(models.DemAgency, {as: 'agency'});
    DemDevice.belongsTo(models.User, {as: 'updatedBy'});
    DemDevice.belongsTo(models.User, {as: 'createdBy'});

    DemDevice.beforeSave(async function(record, options) {
      if (!record.id) {
        record.setDataValue('id', record.data?._attributes?.UUID);
      }
      record.setDataValue('serialNumber', record.data?.['dDevice.01']?._text);
      record.setDataValue('name', record.data?.['dDevice.02']?._text);
      record.setDataValue('primaryType', models.helpers.data.firstValueOf(record.data?.['dDevice.03']));
      record.setDataValue('isValid', record.data?._attributes?.['pr:isValid']);
    });
  };
  sequelizePaginate.paginate(DemDevice);
  return DemDevice;
};
