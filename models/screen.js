const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Screen extends Model {
    static associate(models) {
      Screen.belongsTo(models.Interface, { as: 'interface' });
      Screen.hasOne(models.InterfaceScreen, { as: 'interfaceScreen' });
      Screen.belongsTo(models.User, { as: 'createdBy' });
      Screen.belongsTo(models.User, { as: 'updatedBy' });
      Screen.hasMany(models.Section, { as: 'sections' });
    }
  }
  Screen.init(
    {
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Screen',
      tableName: 'screens',
      underscored: true,
    },
  );
  return Screen;
};
