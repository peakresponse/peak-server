const sequelizePaginate = require('sequelize-paginate');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Vehicle extends Base {
    static get xsdPath() {
      return 'dVehicle_v3.xsd';
    }

    static get rootTag() {
      return 'dVehicle';
    }

    static get groupTag() {
      return 'dVehicle.VehicleGroup';
    }

    static associate(models) {
      Vehicle.belongsTo(Vehicle, { as: 'draftParent' });
      Vehicle.hasOne(Vehicle, { as: 'draft', foreignKey: 'draftParentId' });
      Vehicle.belongsTo(models.User, { as: 'updatedBy' });
      Vehicle.belongsTo(models.User, { as: 'createdBy' });
      Vehicle.belongsTo(models.Agency, { as: 'createdByAgency' });
      Vehicle.belongsTo(models.Version, { as: 'version' });
    }
  }

  Vehicle.init(
    {
      isDraft: {
        type: DataTypes.BOOLEAN,
      },
      number: {
        type: DataTypes.STRING,
      },
      vin: {
        type: DataTypes.STRING,
      },
      callSign: {
        type: DataTypes.STRING,
      },
      type: {
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
      modelName: 'Vehicle',
      tableName: 'vehicles',
      underscored: true,
    }
  );

  Vehicle.addDraftScopes();

  Vehicle.beforeValidate(async (record, options) => {
    record.syncNemsisId(options);
    record.syncFieldAndNemsisValue('number', ['dVehicle.01'], options);
    record.syncFieldAndNemsisValue('vin', ['dVehicle.02'], options);
    record.syncFieldAndNemsisValue('callSign', ['dVehicle.03'], options);
    record.syncFieldAndNemsisValue('type', ['dVehicle.04'], options);
    await record.xsdValidate(options);
  });

  sequelizePaginate.paginate(Vehicle);

  return Vehicle;
};
