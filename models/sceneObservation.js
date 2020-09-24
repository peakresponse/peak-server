const Sequelize = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SceneObservation extends Sequelize.Model {
    static associate(models) {
      SceneObservation.belongsTo(models.Scene, { as: 'scene' });
      SceneObservation.belongsTo(models.SceneObservation, {
        as: 'parent',
        foreignKey: 'parentSceneObservationId',
      });

      SceneObservation.belongsTo(models.City, { as: 'city' });
      SceneObservation.belongsTo(models.County, { as: 'county' });
      SceneObservation.belongsTo(models.State, { as: 'state' });
      SceneObservation.belongsTo(models.User, { as: 'updatedBy' });
      SceneObservation.belongsTo(models.User, { as: 'createdBy' });
      SceneObservation.belongsTo(models.User, { as: 'incidentCommander' });
      SceneObservation.belongsTo(models.Agency, { as: 'updatedByAgency' });
      SceneObservation.belongsTo(models.Agency, { as: 'createdByAgency' });
      SceneObservation.belongsTo(models.Agency, {
        as: 'incidentCommanderAgency',
      });
    }
  }
  // attributes which should only be system modified
  SceneObservation.SYSTEM_ATTRIBUTES = [
    'sceneId',
    'updatedAt',
    'updatedById',
    'updatedByAgencyId',
    'createdAt',
    'createdById',
    'createdByAgencyId',
    'updatedAttributes',
  ];
  SceneObservation.init(
    {
      name: {
        type: DataTypes.STRING,
      },
      desc: {
        type: DataTypes.TEXT,
      },
      urgency: {
        type: DataTypes.TEXT,
      },
      note: {
        type: DataTypes.TEXT,
      },
      approxPatients: {
        type: DataTypes.INTEGER,
        field: 'approx_patients',
      },
      isMCI: {
        type: DataTypes.BOOLEAN,
        field: 'is_mci',
      },
      lat: {
        type: DataTypes.STRING,
      },
      lng: {
        type: DataTypes.STRING,
      },
      geog: {
        type: DataTypes.GEOGRAPHY,
      },
      address1: {
        type: DataTypes.STRING,
      },
      address2: {
        type: DataTypes.STRING,
      },
      zip: {
        type: DataTypes.STRING,
      },
      closedAt: {
        type: DataTypes.DATE,
        field: 'closed_at',
      },
      updatedAttributes: {
        type: DataTypes.JSONB,
        field: 'updated_attributes',
      },
    },
    {
      sequelize,
      modelName: 'SceneObservation',
      tableName: 'scene_observations',
      underscored: true,
    }
  );
  return SceneObservation;
};
