const sequelizePaginate = require('sequelize-paginate');

const nemsis = require('../lib/nemsis');
const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Vehicle extends Base {
    static associate(models) {
      Vehicle.belongsTo(models.User, { as: 'updatedBy' });
      Vehicle.belongsTo(models.User, { as: 'createdBy' });
      Vehicle.belongsTo(models.Agency, { as: 'createdByAgency' });
    }
  }

  Vehicle.init(
    {
      number: {
        type: DataTypes.STRING,
      },
      vin: {
        type: DataTypes.STRING,
      },
      callSign: {
        type: DataTypes.STRING,
        field: 'call_sign',
      },
      type: {
        type: DataTypes.STRING,
      },
      data: DataTypes.JSONB,
      isValid: {
        type: DataTypes.BOOLEAN,
        field: 'is_valid',
      },
    },
    {
      sequelize,
      modelName: 'Vehicle',
      tableName: 'vehicles',
      underscored: true,
      validate: {
        async schema() {
          this.validationError = await nemsis.validateSchema('dVehicle_v3.xsd', 'dVehicle', 'dVehicle.VehicleGroup', this.data);
          this.isValid = this.validationError === null;
          if (this.validationError) throw this.validationError;
        },
      },
    }
  );

  Vehicle.beforeValidate(async (record, options) => {
    record.syncNemsisId(options);
    record.syncFieldAndNemsisValue('number', ['dVehicle.01'], options);
    record.syncFieldAndNemsisValue('vin', ['dVehicle.02'], options);
    record.syncFieldAndNemsisValue('callSign', ['dVehicle.03'], options);
    record.syncFieldAndNemsisValue('type', ['dVehicle.04'], options);
  });

  sequelizePaginate.paginate(Vehicle);

  return Vehicle;
};
