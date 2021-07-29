const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Dispatch extends Base {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Dispatch.belongsTo(models.Incident, { as: 'incident' });
      Dispatch.belongsTo(models.Vehicle, { as: 'vehicle' });
      Dispatch.belongsTo(models.User, { as: 'createdBy' });
      Dispatch.belongsTo(models.User, { as: 'updatedBy' });
      Dispatch.belongsTo(models.Agency, { as: 'createdByAgency' });
      Dispatch.belongsTo(models.Agency, { as: 'updatedByAgency' });
    }
  }
  Dispatch.init(
    {
      dispatchedAt: {
        type: DataTypes.DATE,
        field: 'dispatched_at',
      },
      acknowledgedAt: {
        type: DataTypes.DATE,
        field: 'acknowledged_at',
      },
      data: DataTypes.JSONB,
    },
    {
      sequelize,
      modelName: 'Dispatch',
      tableName: 'dispatches',
      underscored: true,
    }
  );
  return Dispatch;
};
