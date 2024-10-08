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
      let where;
      if (data.userId) {
        // there is always only one active Responder record (departedAt IS NULL) per user
        // so we fetch the active record by compound keys instead of id to handle same
        // account signed into multiple clients
        where = {
          userId: data.userId,
          sceneId: data.sceneId,
          departedAt: null,
        };
      } else {
        // for manually entered Responder records, fall back to unique id
        where = {
          id: data.id,
        };
      }
      const [responder, created] = await Responder.findOrCreate({
        where,
        defaults: {
          ..._.pick(data, [
            'id',
            'sceneId',
            'role',
            'agencyId',
            'vehicleId',
            'agencyName',
            'unitNumber',
            'callSign',
            'capability',
            'arrivedAt',
            'departedAt',
          ]),
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
      const attrs = [];
      // record is mutable before departure
      if (!responder.departedAt) {
        attrs.push('role', 'arrivedAt', 'departedAt');
        // allow agency/unit changes if not a User account Responder
        if (!responder.userId) {
          attrs.push('agencyId', 'agencyName', 'unitNumber', 'callSign', 'capability');
        }
      }
      if (attrs.length > 0) {
        await responder.update(_.pick(data, attrs), { transaction });
      }
      return [responder, created];
    }

    toJSON() {
      const attributes = { ...this.get() };
      return _.pick(attributes, [
        'id',
        'sceneId',
        'userId',
        'role',
        'agencyId',
        'agencyName',
        'vehicleId',
        'unitNumber',
        'callSign',
        'capability',
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
      role: DataTypes.STRING,
      agencyName: DataTypes.STRING,
      unitNumber: DataTypes.STRING,
      callSign: DataTypes.STRING,
      capability: DataTypes.STRING,
      arrivedAt: DataTypes.DATE,
      departedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Responder',
      tableName: 'responders',
      underscored: true,
    },
  );

  Responder.addScope('onscene', {
    where: { departedAt: null },
  });

  return Responder;
};
