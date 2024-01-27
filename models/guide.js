const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Guide extends Model {
    static associate(models) {
      Guide.belongsTo(models.User, { as: 'createdBy' });
      Guide.belongsTo(models.User, { as: 'updatedBy' });
      Guide.hasMany(models.GuideSection, { as: 'sections' });
    }
  }
  Guide.init(
    {
      name: DataTypes.TEXT,
      navName: DataTypes.TEXT,
      slug: DataTypes.CITEXT,
      body: DataTypes.TEXT,
      position: DataTypes.INTEGER,
      isVisible: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'Guide',
      tableName: 'guides',
      underscored: true,
    },
  );
  return Guide;
};
