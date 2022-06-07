const _ = require('lodash');
const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Responder extends Base {
    static get Roles() {
      return {
        STAGING: 'STAGING',
        TRANSPORT: 'TRANSPORT',
        TREATMENT: 'TREATMENT',
        TRIAGE: 'TRIAGE',
      };
    }

    static associate(models) {
      Responder.belongsTo(models.Scene, { as: 'scene' });
      Responder.belongsTo(models.User, { as: 'user' });
      Responder.belongsTo(models.Agency, { as: 'agency' });
      Responder.belongsTo(models.Vehicle, { as: 'vehicle' });

      Responder.belongsTo(models.User, { as: 'updatedBy' });
      Responder.belongsTo(models.User, { as: 'createdBy' });
      Responder.belongsTo(models.Agency, { as: 'updatedByAgency' });
      Responder.belongsTo(models.Agency, { as: 'createdByAgency' });
    }

    static async createOrUpdate(user, agency, data, options) {
      const { transaction } = options ?? {};
      const [responder, created] = await Responder.findOrCreate({
        where: {
          id: data.id,
        },
        defaults: {
          ..._.pick(data, ['sceneId', 'userId', 'agencyId', 'vehicleId', 'arrivedAt', 'departedAt']),
          createdById: user.id,
          createdByAgencyId: agency.id,
          updatedById: user.id,
          updatedByAgencyId: agency.id,
        },
        transaction,
      });
      if (created) {
        return [responder, created];
      }
      await responder.update(_.pick(data, ['arrivedAt', 'departedAt']), { transaction });
      return [responder, created];
    }

    toJSON() {
      const attributes = { ...this.get() };
      return _.pick(attributes, [
        'id',
        'sceneId',
        'userId',
        'agencyId',
        'vehicleId',
        'arrivedAt',
        'departedAt',
        'createdAt',
        'createdById',
        'createdByAgencyId',
        'updatedAt',
        'updatedById',
        'updatedByAgencyId',
      ]);
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

  return Responder;
};
