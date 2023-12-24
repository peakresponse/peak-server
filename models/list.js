const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class List extends Model {
    static associate(models) {
      // associations can be defined here
      List.belongsTo(models.Agency, { as: 'agency' });
      List.belongsTo(models.User, { as: 'createdBy' });
      List.belongsTo(models.User, { as: 'updatedBy' });
      List.hasMany(models.ListSection, { as: 'sections', foreignKey: 'listId' });
      List.hasMany(models.ListItem, { as: 'items', foreignKey: 'listId' });
    }
  }
  List.init(
    {
      fields: {
        type: DataTypes.JSONB,
      },
    },
    {
      sequelize,
      modelName: 'List',
      tableName: 'lists',
      underscored: true,
    },
  );
  return List;
};
