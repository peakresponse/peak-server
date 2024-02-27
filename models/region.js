const { Model } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, DataTypes) => {
  class Region extends Model {
    static associate(models) {
      Region.belongsTo(models.User, { as: 'createdBy' });
      Region.belongsTo(models.User, { as: 'updatedBy' });
      Region.belongsToMany(models.Agency, { as: 'agencies', through: models.RegionAgency.scope('ordered') });
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
