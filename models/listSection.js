const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ListSection extends Model {
    static associate(models) {
      // associations can be defined here
      ListSection.belongsTo(models.List, { as: 'list' });
      ListSection.belongsTo(models.User, { as: 'createdBy' });
      ListSection.belongsTo(models.User, { as: 'updatedBy' });
      ListSection.hasMany(models.ListItem, { as: 'items', foreignKey: 'sectionId' });
    }
  }
  ListSection.init(
    {
      name: {
        type: DataTypes.STRING,
      },
      position: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: 'ListSection',
      tableName: 'list_sections',
      underscored: true,
    },
  );
  return ListSection;
};
