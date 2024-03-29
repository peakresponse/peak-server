const { Model } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, DataTypes) => {
  class Dispatcher extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Dispatcher.belongsTo(models.User, { as: 'user' });
      Dispatcher.belongsTo(models.Psap, { as: 'psap' });
      Dispatcher.belongsTo(models.User, { as: 'createdBy' });
      Dispatcher.belongsTo(models.User, { as: 'updatedBy' });
    }
  }
  Dispatcher.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        autoIncrement: true,
      },
      callSign: {
        type: DataTypes.STRING,
        field: 'call_sign',
      },
    },
    {
      sequelize,
      modelName: 'Dispatcher',
      tableName: 'dispatchers',
      underscored: true,
    },
  );
  sequelizePaginate.paginate(Dispatcher);
  return Dispatcher;
};
