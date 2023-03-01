const { Op } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Vehicle extends Base {
    static associate(models) {
      Vehicle.belongsTo(Vehicle, { as: 'draftParent' });
      Vehicle.hasOne(Vehicle, { as: 'draft', foreignKey: 'draftParentId' });
      Vehicle.belongsTo(models.User, { as: 'updatedBy' });
      Vehicle.belongsTo(models.User, { as: 'createdBy' });
      Vehicle.belongsTo(models.Agency, { as: 'createdByAgency' });
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
      validationErrors: {
        type: DataTypes.JSONB,
      },
      archivedAt: {
        type: DataTypes.DATE,
        field: 'archived_at',
      },
    },
    {
      sequelize,
      modelName: 'Vehicle',
      tableName: 'vehicles',
      underscored: true,
    }
  );

  Vehicle.addScope('finalOrNew', {
    where: {
      [Op.or]: {
        isDraft: false,
        [Op.and]: {
          isDraft: true,
          draftParentId: null,
        },
      },
    },
  });

  Vehicle.addScope('final', {
    where: {
      isDraft: false,
    },
  });

  Vehicle.beforeValidate(async (record, options) => {
    record.syncNemsisId(options);
    record.syncFieldAndNemsisValue('number', ['dVehicle.01'], options);
    record.syncFieldAndNemsisValue('vin', ['dVehicle.02'], options);
    record.syncFieldAndNemsisValue('callSign', ['dVehicle.03'], options);
    record.syncFieldAndNemsisValue('type', ['dVehicle.04'], options);
    await record.validateNemsisData('dVehicle_v3.xsd', 'dVehicle', 'dVehicle.VehicleGroup', options);
  });

  sequelizePaginate.paginate(Vehicle);

  return Vehicle;
};
