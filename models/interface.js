const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Interface extends Model {
    static associate(models) {
      Interface.belongsTo(models.User, { as: 'createdBy' });
      Interface.belongsTo(models.User, { as: 'updatedBy' });
      Interface.hasMany(models.Screen, { as: 'screens' });
    }
  }
  Interface.init(
    {
      minAppVersion: DataTypes.STRING,
      nemsisVersion: DataTypes.STRING,
      dataSet: DataTypes.STRING,
      name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Interface',
      tableName: 'interfaces',
      underscored: true,
    },
  );
  return Interface;
};
