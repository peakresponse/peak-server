const _ = require('lodash');
const { Model } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, DataTypes) => {
  class Region extends Model {
    static associate(models) {
      Region.belongsTo(models.User, { as: 'createdBy' });
      Region.belongsTo(models.User, { as: 'updatedBy' });
      Region.hasMany(models.RegionAgency, { as: 'regionAgencies' });
    }

    toJSON() {
      const attributes = { ...this.get() };
      const data = _.pick(attributes, ['id', 'name', 'createdById', 'updatedById', 'createdAt', 'updatedAt']);
      if (this.regionAgencies) {
        data.regionAgencies = this.regionAgencies.map((ra) => ra.toJSON());
      }
      return data;
    }
  }

  Region.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Region',
      tableName: 'regions',
      underscored: true,
    },
  );

  sequelizePaginate.paginate(Region);

  return Region;
};
