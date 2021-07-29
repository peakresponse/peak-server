const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Incident extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Incident.belongsTo(models.Psap, { as: 'psap' });
      Incident.belongsTo(models.Scene, { as: 'scene' });
      Incident.belongsTo(models.User, { as: 'createdBy' });
      Incident.belongsTo(models.User, { as: 'updatedBy' });
      Incident.belongsTo(models.Agency, { as: 'createdByAgency' });
      Incident.belongsTo(models.Agency, { as: 'updatedByAgency' });
    }
  }
  Incident.init(
    {
      number: DataTypes.STRING,
      calledAt: {
        type: DataTypes.DATE,
        field: 'called_at',
      },
      dispatchNotifiedAt: {
        type: DataTypes.DATE,
        field: 'dispatch_notified_at',
      },
    },
    {
      sequelize,
      modelName: 'Incident',
      tableName: 'incidents',
      underscored: true,
    }
  );
  return Incident;
};
