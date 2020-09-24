const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Responder extends Model {
    static associate(models) {
      Responder.belongsTo(models.Scene, { as: 'scene' });
      Responder.belongsTo(models.User, { as: 'user' });
      Responder.belongsTo(models.Agency, { as: 'agency' });

      Responder.belongsTo(models.User, { as: 'updatedBy' });
      Responder.belongsTo(models.User, { as: 'createdBy' });
      Responder.belongsTo(models.Agency, { as: 'updatedByAgency' });
      Responder.belongsTo(models.Agency, { as: 'createdByAgency' });
    }

    async toFullJSON(options) {
      const json = this.toJSON();
      json.user = (this.user || (await this.getUser(options)))?.toJSON();
      json.agency = (this.agency || (await this.getAgency(options)))?.toJSON();
      return json;
    }
  }

  Responder.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      arrivedAt: {
        type: DataTypes.DATE,
        field: 'arrived_at',
      },
      departedAt: {
        type: DataTypes.DATE,
        field: 'departed_at',
      },
    },
    {
      sequelize,
      modelName: 'Responder',
      tableName: 'responders',
      underscored: true,
    }
  );

  Responder.addScope('onscene', {
    where: { departedAt: null },
  });

  Responder.addScope('latest', {
    attributes: [
      sequelize.literal('DISTINCT ON("Responder".user_id) 1'),
    ].concat(Object.keys(Responder.rawAttributes)),
    order: [
      ['user_id', 'ASC'],
      ['arrived_at', 'DESC'],
    ],
  });

  return Responder;
};
