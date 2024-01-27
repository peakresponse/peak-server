const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GuideSection extends Model {
    static associate(models) {
      GuideSection.belongsTo(models.User, { as: 'createdBy' });
      GuideSection.belongsTo(models.User, { as: 'updatedBy' });
      GuideSection.belongsTo(models.Guide, { as: 'guide' });
      GuideSection.hasMany(models.GuideItem, { as: 'items' });
    }
  }
  GuideSection.init(
    {
      name: DataTypes.TEXT,
      body: DataTypes.TEXT,
      position: DataTypes.INTEGER,
      isVisible: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'GuideSection',
      tableName: 'guide_sections',
      underscored: true,
    },
  );
  return GuideSection;
};
