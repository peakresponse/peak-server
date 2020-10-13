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
      number: DataTypes.STRING,
      vin: DataTypes.STRING,
      callSign: {
        type: DataTypes.STRING,
        field: 'call_sign',
      },
      type: DataTypes.STRING,
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
          if (this.validationError) throw this.validationError;
        },
      },
    }
  );

  Vehicle.beforeSave(async (record) => {
    if (!record.id) {
      record.setDataValue('id', record.data?._attributes?.UUID);
    }
    record.setDataValue('number', record.data?.['dVehicle.01']?._text);
    record.setDataValue('vin', record.data?.['dVehicle.02']?._text);
    record.setDataValue('callSign', record.data?.['dVehicle.03']?._text);
    record.setDataValue('type', record.data?.['dVehicle.04']?._text);
    record.setDataValue('isValid', record.data?._attributes?.['pr:isValid']);
  });

  sequelizePaginate.paginate(Vehicle);

  return Vehicle;
};
