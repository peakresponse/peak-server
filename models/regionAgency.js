const _ = require('lodash');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RegionAgency extends Model {
    static associate(models) {
      RegionAgency.belongsTo(models.Region, { as: 'region' });
      RegionAgency.belongsTo(models.Agency, { as: 'agency' });
      RegionAgency.belongsTo(models.User, { as: 'createdBy' });
      RegionAgency.belongsTo(models.User, { as: 'updatedBy' });
    }

    toJSON() {
      const attributes = { ...this.get() };
      const data = _.pick(attributes, [
        'id',
        'regionId',
        'agencyId',
        'agencyName',
        'position',
        'createdById',
        'updatedById',
        'createdAt',
        'updatedAt',
      ]);
      if (this.agency) {
        data.agency = this.agency.toJSON();
      }
      return data;
    }
  }

  RegionAgency.init(
    {
      agencyName: DataTypes.STRING,
      position: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'RegionAgency',
      tableName: 'region_agencies',
      underscored: true,
    },
  );

  RegionAgency.addScope('ordered', {
    order: [['position', 'ASC']],
  });

  return RegionAgency;
};
