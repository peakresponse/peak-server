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
      Incident.hasMany(models.Dispatch.scope('canonical'), { as: 'dispatches', foreignKey: 'incidentId' });
    }

    static async paginateForAgency(agency, options) {
      const limit = 25;
      const offset = (parseInt(options?.page ?? 1, 10) - 1) * limit;
      const docs = await sequelize.query(
        `SELECT DISTINCT(incidents.*) FROM incidents
         INNER JOIN dispatches ON incidents.id=dispatches.incident_id
         INNER JOIN vehicles ON vehicles.id=dispatches.vehicle_id
         WHERE vehicles.created_by_agency_id=:agencyId
         ORDER BY incidents.number DESC
         LIMIT :limit OFFSET :offset`,
        {
          replacements: {
            agencyId: agency.id,
            limit,
            offset,
          },
          model: Incident,
          mapToModel: true,
        }
      );
      const [{ count }] = await sequelize.query(
        `SELECT COUNT(DISTINCT(incidents.id)) FROM incidents
         INNER JOIN dispatches ON incidents.id=dispatches.incident_id
         INNER JOIN vehicles ON vehicles.id=dispatches.vehicle_id
         WHERE vehicles.created_by_agency_id=:agencyId`,
        {
          raw: true,
          replacements: {
            agencyId: agency.id,
          },
          type: sequelize.QueryTypes.SELECT,
        }
      );
      const total = parseInt(count, 10);
      const pages = Math.round(total / limit) + 1;
      // manually eager-load scene records
      const sceneIds = docs.map((incident) => incident.sceneId);
      const scenes = await sequelize.models.Scene.findAll({ where: { id: sceneIds } });
      const sceneMap = scenes.reduce((map, scene) => {
        map[scene.id] = scene;
        return map;
      }, {});
      docs.forEach((incident) => incident.setDataValue('scene', sceneMap[incident.sceneId]));
      return { docs, pages, total };
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
  Incident.addScope('agency', (agencyId) => ({
    attributes: [sequelize.literal('DISTINCT ON("Incident".number) 1')].concat(Object.keys(Incident.rawAttributes)),
    include: [
      {
        model: sequelize.models.Dispatch,
        as: 'dispatches',
        required: true,
        include: [
          {
            model: sequelize.models.Vehicle,
            as: 'vehicle',
            required: true,
          },
        ],
      },
    ],
    where: {
      '$dispatches.vehicle.created_by_agency_id$': agencyId,
    },
  }));
  return Incident;
};
