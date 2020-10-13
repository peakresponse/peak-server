const _ = require('lodash');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Responder extends Model {
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

      Responder.belongsTo(models.User, { as: 'updatedBy' });
      Responder.belongsTo(models.User, { as: 'createdBy' });
      Responder.belongsTo(models.Agency, { as: 'updatedByAgency' });
      Responder.belongsTo(models.Agency, { as: 'createdByAgency' });
    }

    toJSON() {
      const attributes = { ...this.get() };
      return _.pick(attributes, [
        'id',
        'sceneId',
        'userId',
        'agencyId',
        'arrivedAt',
        'departedAt',
        'role',
        'createdAt',
        'createdById',
        'createdByAgencyId',
        'updatedAt',
        'updatedById',
        'updatedByAgencyId',
      ]);
    }

    async toFullJSON(options) {
      const json = this.toJSON();
      json.user = (this.user || (await this.getUser(options)))?.toJSON();
      json.agency = (this.agency || (await this.getAgency(options)))?.toPublicJSON();
      return json;
    }

    async assign(user, agency, role, options) {
      let ids = [];
      /// if already has the role, just return
      if (this.role === role) {
        return ids;
      }
      await sequelize.transaction({ transaction: options?.transaction }, async (transaction) => {
        /// remove any other existing Responder with this role
        if (role !== null) {
          [, ids] = await Responder.update(
            { role: null },
            {
              where: {
                role,
                departedAt: null,
              },
              raw: true,
              returning: ['id'],
              transaction,
            }
          );
        }
        /// assign and save to this Responder
        await this.update(
          {
            role,
            updatedById: user.id,
            updatedByAgencyId: agency.id,
          },
          { transaction }
        );
        /// include this record in the list of modified ids
        ids.push({ id: this.id });
      });
      return ids.map((obj) => obj.id);
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
      role: {
        type: DataTypes.ENUM('STAGING', 'TRANSPORT', 'TRIAGE', 'TREATMENT'),
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

  Responder.addScope('latest', () => ({
    attributes: [sequelize.literal('DISTINCT ON("Responder".user_id) 1')].concat(Object.keys(Responder.rawAttributes)),
    order: [
      ['user_id', 'ASC'],
      ['arrived_at', 'DESC'],
    ],
  }));

  return Responder;
};
