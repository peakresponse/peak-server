const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ListItem extends Model {
    static associate(models) {
      // associations can be defined here
      ListItem.belongsTo(models.List, { as: 'list' });
      ListItem.belongsTo(models.ListSection, { as: 'section' });
      ListItem.belongsTo(models.User, { as: 'createdBy' });
      ListItem.belongsTo(models.User, { as: 'updatedBy' });
    }
  }
  ListItem.init(
    {
      sectionId: {
        type: DataTypes.UUID,
        field: 'list_section_id',
      },
      system: {
        type: DataTypes.ENUM('ICD10CM', 'SNOMED', 'RXNORM'),
      },
      code: {
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'ListItem',
      tableName: 'list_items',
      underscored: true,
    }
  );
  return ListItem;
};