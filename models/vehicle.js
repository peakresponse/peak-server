const sequelizePaginate = require('sequelize-paginate');
const uuid = require('uuid/v4');

const nemsis = require('../lib/nemsis');
const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Vehicle extends Base {
    constructor(value, options) {
      super(value, options);
      if (!this.id && !this.getNemsisAttributeValue([], 'UUID')) {
        this.setNemsisAttributeValue([], 'UUID', uuid());
      }
    }

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
        set(newValue) {
          this.setFieldAndNemsisValue('number', ['dVehicle.01'], newValue);
        },
      },
      vin: {
        type: DataTypes.STRING,
        set(newValue) {
          this.setFieldAndNemsisValue('vin', ['dVehicle.02'], newValue);
        },
      },
      callSign: {
        type: DataTypes.STRING,
        field: 'call_sign',
        set(newValue) {
          this.setFieldAndNemsisValue('callSign', ['dVehicle.03'], newValue);
        },
      },
      type: {
        type: DataTypes.STRING,
        set(newValue) {
          this.setFieldAndNemsisValue('type', ['dVehicle.04'], newValue);
        },
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

  Vehicle.beforeSave(async (record) => {
    if (!record.id) {
      record.setDataValue('id', record.getNemsisAttributeValue([], 'UUID'));
    }
    record.setDataValue('number', record.getFirstNemsisValue(['dVehicle.01']));
    record.setDataValue('vin', record.getFirstNemsisValue(['dVehicle.02']));
    record.setDataValue('callSign', record.getFirstNemsisValue(['dVehicle.03']));
    record.setDataValue('type', record.getFirstNemsisValue(['dVehicle.04']));
  });

  sequelizePaginate.paginate(Vehicle);

  return Vehicle;
};
