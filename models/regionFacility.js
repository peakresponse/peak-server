const _ = require('lodash');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RegionFacility extends Model {
    static associate(models) {
      RegionFacility.belongsTo(models.Region, { as: 'region' });
      RegionFacility.belongsTo(models.Facility, { as: 'facility' });
      RegionFacility.belongsTo(models.User, { as: 'createdBy' });
      RegionFacility.belongsTo(models.User, { as: 'updatedBy' });
    }

    toJSON() {
      const attributes = { ...this.get() };
      const data = _.pick(attributes, [
        'id',
        'regionId',
        'facilityId',
        'facilityName',
        'position',
        'createdById',
        'updatedById',
        'createdAt',
        'updatedAt',
      ]);
      if (this.facility) {
        data.facility = this.facility.toJSON();
      }
      return data;
    }
  }

  RegionFacility.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      facilityName: DataTypes.STRING,
      position: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'RegionFacility',
      tableName: 'region_facilities',
      underscored: true,
    },
  );

  RegionFacility.addScope('ordered', {
    order: [['position', 'ASC']],
  });

  return RegionFacility;
};
