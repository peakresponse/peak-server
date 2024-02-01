const _ = require('lodash');
const { Model, Op } = require('sequelize');

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
      Incident.belongsToMany(models.Agency, {
        as: 'dispatchedAgencies',
        through: 'incidents_agencies',
        foreignKey: 'incidentId',
        timestamps: false,
      });
      Incident.hasMany(models.Dispatch.scope('canonical'), { as: 'dispatches', foreignKey: 'incidentId' });
      Incident.hasMany(models.Report.scope('canonical'), { as: 'reports', foreignKey: 'incidentId' });
    }

    static async createPayload(incidents, options = {}) {
      const { transaction } = options;
      const payload = {
        Dispatch: [],
        Incident: [],
        Scene: [],
      };
      const ids = {
        City: new Set(),
        State: new Set(),
        Vehicle: new Set(),
      };
      for (const incident of incidents) {
        payload.Incident.push(incident.toJSON());
        let { scene, dispatches } = incident;
        if (!scene) {
          // eslint-disable-next-line no-await-in-loop
          scene = await incident.getScene({ transaction });
        }
        if (scene) {
          payload.Scene.push(scene.toJSON());
          ids.City.add(scene.cityId);
          ids.State.add(scene.stateId);
        }
        if (!dispatches) {
          // eslint-disable-next-line no-await-in-loop
          dispatches = await incident.getDispatches({ transaction });
        }
        dispatches.forEach((d) => {
          payload.Dispatch.push(d.toJSON());
          ids.Vehicle.add(d.vehicleId);
        });
      }
      for (const model of ['City', 'State', 'Vehicle']) {
        // eslint-disable-next-line no-await-in-loop
        const records = await sequelize.models[model].findAll({ where: { id: [...ids[model]] }, transaction });
        payload[model] = records.map((record) => record.toJSON());
      }
      return payload;
    }

    static async paginate(type, obj, options) {
      const limit = options?.paginate ?? 25;
      const offset = (parseInt(options?.page ?? 1, 10) - 1) * limit;
      let searchConditions = '';
      // let joins = '';
      const joins = '';
      let search = '';
      if (options?.search) {
        search = `%${options.search}%`;
        // joins = `
        //  INNER JOIN scenes ON incidents.scene_id=scenes.id
        // `;
        searchConditions = `
         AND (incidents.number ILIKE :search)`;
        //  OR scenes.address1 ILIKE :search
        //  OR scenes.address2 ILIKE :search)
        // `;
      }
      let conditions;
      if (type === 'Agency') {
        conditions = `
         LEFT JOIN vehicles ON dispatches.vehicle_id=vehicles.id
         WHERE vehicles.created_by_agency_id=:objId
         OR incidents.created_by_agency_id=:objId
         `;
      } else if (type === 'Vehicle') {
        conditions = `
         WHERE dispatches.vehicle_id=:objId
        `;
      } else {
        throw new Error();
      }
      const docs = await sequelize.query(
        `SELECT DISTINCT(incidents.*)
         FROM incidents ${joins}
         LEFT JOIN dispatches ON incidents.id=dispatches.incident_id
         ${conditions} ${searchConditions}
         ORDER BY sort DESC, number DESC
         LIMIT :limit OFFSET :offset`,
        {
          replacements: {
            objId: obj.id,
            search,
            limit,
            offset,
          },
          model: Incident,
          mapToModel: true,
          transaction: options?.transaction,
        },
      );
      const [{ count }] = await sequelize.query(
        `SELECT COUNT(DISTINCT(incidents.id)) FROM incidents ${joins}
         LEFT JOIN dispatches ON incidents.id=dispatches.incident_id
         ${conditions} ${searchConditions}`,
        {
          raw: true,
          replacements: {
            objId: obj.id,
            search,
          },
          type: sequelize.QueryTypes.SELECT,
          transaction: options?.transaction,
        },
      );
      const total = parseInt(count, 10);
      const pages = Math.round(total / limit) + 1;
      // manually eager-load scene records
      const sceneIds = docs.map((incident) => incident.sceneId);
      const scenes = await sequelize.models.Scene.findAll({
        include: ['city', 'state'],
        where: { id: sceneIds },
        transaction: options?.transaction,
      });
      const sceneMap = scenes.reduce((map, scene) => {
        map[scene.id] = scene;
        return map;
      }, {});
      // manually eager-load dispatch records
      const incidentIds = docs.map((incident) => incident.id);
      const dispatches = await sequelize.models.Dispatch.scope('canonical').findAll({
        where: {
          incidentId: incidentIds,
        },
        order: [['dispatchedAt', 'ASC']],
        transaction: options?.transaction,
      });
      const dispatchesMap = dispatches.reduce((map, dispatch) => {
        map[dispatch.incidentId] = map[dispatch.incidentId] || [];
        map[dispatch.incidentId].push(dispatch);
        return map;
      }, {});
      docs.forEach((incident) => {
        incident.scene = sceneMap[incident.sceneId];
        incident.setDataValue('scene', sceneMap[incident.sceneId]);
        incident.dispatches = dispatchesMap[incident.id];
        incident.setDataValue('dispatches', dispatchesMap[incident.id]);
      });
      return { docs, pages, total };
    }

    async updateReportsCount(options) {
      const { transaction } = options ?? {};
      return this.update({ reportsCount: await this.countReports({ transaction }) }, { transaction });
    }

    async updateDispatchedAgencies(options) {
      const { transaction } = options ?? {};
      const dispatches = await this.getDispatches({
        include: ['vehicle'],
        transaction,
      });
      const agencyIds = dispatches.map((d) => d.vehicle.createdByAgencyId).filter((v, i, a) => a.indexOf(v) === i);
      return this.setDispatchedAgencies(agencyIds, { transaction });
    }

    toJSON() {
      const attributes = { ...this.get() };
      return _.pick(attributes, [
        'id',
        'psapId',
        'sceneId',
        'number',
        'sort',
        'calledAt',
        'dispatchNotifiedAt',
        'reportsCount',
        'createdAt',
        'createdById',
        'createdByAgencyId',
        'updatedAt',
        'updatedById',
        'updatedByAgencyId',
      ]);
    }
  }

  Incident.init(
    {
      number: {
        type: DataTypes.STRING,
        set(newValue) {
          this.setDataValue('number', newValue);
          let rawValue = newValue;
          if (rawValue) {
            const index = rawValue.indexOf('-');
            if (index >= 0) {
              rawValue = rawValue.substring(0, index);
            }
            rawValue = rawValue.replace(/\D/g, '');
          }
          if (rawValue?.length) {
            this.setDataValue('sort', parseInt(rawValue, 10));
          } else {
            this.setDataValue('sort', 0);
          }
        },
      },
      sort: DataTypes.INTEGER,
      calledAt: {
        type: DataTypes.DATE,
        field: 'called_at',
      },
      dispatchNotifiedAt: {
        type: DataTypes.DATE,
        field: 'dispatch_notified_at',
      },
      reportsCount: {
        type: DataTypes.INTEGER,
        field: 'reports_count',
      },
    },
    {
      sequelize,
      modelName: 'Incident',
      tableName: 'incidents',
      underscored: true,
    },
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

  Incident.addScope('scene', (sceneId) => ({
    include: [
      {
        model: sequelize.models.Scene,
        as: 'scene',
      },
    ],
    where: {
      [Op.or]: [{ '$scene.id$': sceneId }, { '$scene.canonical_id$': sceneId }],
    },
  }));

  return Incident;
};
