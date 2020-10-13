const _ = require('lodash');
const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ScenePin extends Sequelize.Model {
    static get Types() {
      return {
        MGS: 'MGS',
        OTHER: 'OTHER',
        STAGING: 'STAGING',
        TRANSPORT: 'TRANSPORT',
        TREATMENT: 'TREATMENT',
        TRIAGE: 'TRIAGE',
      };
    }

    static associate(models) {
      ScenePin.belongsTo(models.Scene, { as: 'scene' });
      ScenePin.belongsTo(models.User, { as: 'updatedBy' });
      ScenePin.belongsTo(models.User, { as: 'createdBy' });
      ScenePin.belongsTo(models.User, { as: 'deletedBy' });
      ScenePin.belongsTo(models.Agency, { as: 'updatedByAgency' });
      ScenePin.belongsTo(models.Agency, { as: 'createdByAgency' });
      ScenePin.belongsTo(models.Agency, { as: 'deletedByAgency' });
    }

    static async createOrUpdate(user, agency, scene, data, options) {
      let pin;
      await sequelize.transaction({ transaction: options?.transaction }, async (transaction) => {
        if (data.id) {
          const prevPin = await ScenePin.findByPk(data.id, { transaction });
          if (prevPin) {
            pin = prevPin;
            return;
          }
        }
        if (data.type !== ScenePin.Types.OTHER) {
          const prevPin = await ScenePin.findOne({
            where: {
              sceneId: scene.id,
              type: data.type,
              deletedAt: null,
            },
            transaction,
          });
          if (prevPin) {
            await prevPin.update(
              {
                deletedById: user.id,
                deletedByAgencyId: agency.id,
                deletedAt: new Date(),
              },
              { transaction }
            );
          }
        }
        pin = await ScenePin.create(
          _.assign(_.pick(data, ['id', 'type', 'lat', 'lng', 'name', 'desc']), {
            sceneId: scene.id,
            createdById: user.id,
            updatedById: user.id,
            createdByAgencyId: agency.id,
            updatedByAgencyId: agency.id,
          }),
          { transaction }
        );
      });
      return pin;
    }
  }

  ScenePin.init(
    {
      type: {
        type: DataTypes.ENUM('MGS', 'OTHER', 'STAGING', 'TRANSPORT', 'TRIAGE', 'TREATMENT'),
        allowNull: false,
      },
      lat: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lng: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      geog: {
        type: DataTypes.GEOGRAPHY,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
      },
      desc: {
        type: DataTypes.TEXT,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: 'ScenePin',
      tableName: 'scene_pins',
      underscored: true,
    }
  );

  ScenePin.beforeValidate((record) => {
    if (record.lat && record.lng) {
      record.geog = {
        type: 'Point',
        coordinates: [parseFloat(record.lng), parseFloat(record.lat)],
      };
    }
  });

  return ScenePin;
};
