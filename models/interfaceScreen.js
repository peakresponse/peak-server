const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InterfaceScreen extends Model {
    static associate(models) {
      InterfaceScreen.belongsTo(models.Interface, { as: 'interface' });
      InterfaceScreen.belongsTo(models.Screen, { as: 'screen' });
    }
  }
  InterfaceScreen.init(
    {
      position: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'InterfaceScreen',
      tableName: 'interface_screens',
      underscored: true,
    },
  );
  return InterfaceScreen;
};
