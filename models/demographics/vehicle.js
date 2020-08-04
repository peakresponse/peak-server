'use strict';

const sequelizePaginate = require('sequelize-paginate')
const nemsis = require('../../lib/nemsis');

module.exports = (sequelize, DataTypes) => {
  const Vehicle = sequelize.define('Vehicle', {
    number: DataTypes.STRING,
    vin: DataTypes.STRING,
    callSign: {
      type: DataTypes.STRING,
      field: 'call_sign'
    },
    type: DataTypes.STRING,
    data: DataTypes.JSONB,
    isValid: {
      type: DataTypes.BOOLEAN,
      field: 'is_valid'
    }
  }, {
    schema: 'demographics',
    tableName: 'vehicles',
    underscored: true,
    validate: {
      schema: async function() {
        this.validationError = await nemsis.validateSchema('dVehicle_v3.xsd', 'dVehicle', 'dVehicle.VehicleGroup', this.data);
        if (this.validationError) throw this.validationError;
      }
    }
  });
  Vehicle.associate = function(models) {
    Vehicle.belongsTo(models.DemAgency, {as: 'agency'});
    Vehicle.belongsTo(models.User, {as: 'updatedBy'});
    Vehicle.belongsTo(models.User, {as: 'createdBy'});

    Vehicle.beforeSave(async function(record, options) {
      if (!record.id) {
        record.setDataValue('id', record.data?._attributes?.UUID);
      }
      record.setDataValue('number', record.data?.['dVehicle.01']?._text);
      record.setDataValue('vin', record.data?.['dVehicle.02']?._text);
      record.setDataValue('callSign', record.data?.['dVehicle.03']?._text);
      record.setDataValue('type', record.data?.['dVehicle.04']?._text);
      record.setDataValue('isValid', record.data?._attributes?.['pr:isValid']);
    });
  };
  sequelizePaginate.paginate(Vehicle);
  return Vehicle;
};
