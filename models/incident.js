const _ = require('lodash');
const { Model, Op } = require('sequelize');
const { v4: uuid } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  class Incident extends Model {
    static associate(models) {
      Incident.belongsTo(models.Event, { as: 'event' });
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
          JOIN incidents_agencies ON incidents.id=incidents_agencies.incident_id
          WHERE incidents_agencies.agency_id=:objId
        `;
      } else if (type === 'Event') {
        conditions = `
          WHERE incidents.event_id=:objId
        `;
      } else if (type === 'Vehicle') {
        conditions = `
          JOIN dispatches ON incidents.id=dispatches.incident_id
          WHERE dispatches.vehicle_id=:objId AND dispatches.canonical_id IS NULL
        `;
      } else {
        throw new Error();
      }
      const docs = await sequelize.query(
        `SELECT incidents.*
         FROM incidents ${joins}
         ${conditions} ${searchConditions}
         ORDER BY sort DESC, created_at DESC
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
        `SELECT COUNT(incidents.id) FROM incidents ${joins}
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

    async updatePatientsCounts(user, agency, { transaction }) {
      // get the latest canonical scene
      const scene = await this.getScene({ transaction });
      // query canonical reports for the incident
      const reports = await this.getReports({ attributes: ['priority', 'filterPriority', 'deletedAt'], transaction });
      // count by priority and filterPriority for transported patients
      const priorityPatientsCounts = [0, 0, 0, 0, 0, 0];
      const transpPriorityPatientsCounts = [0, 0, 0, 0, 0, 0];
      for (const report of reports) {
        if (!report.isDeleted) {
          if (report.priority !== null && report.priority !== undefined) {
            priorityPatientsCounts[report.priority] += 1;
            if (report.filterPriority === sequelize.models.Patient.Priority.TRANSPORTED) {
              transpPriorityPatientsCounts[report.priority] += 1;
            }
          }
        }
      }
      return sequelize.models.Scene.createOrUpdate(
        user,
        agency,
        {
          id: uuid(),
          parentId: scene.currentId,
          priorityPatientsCounts,
          transpPriorityPatientsCounts,
        },
        { transaction },
      );
    }

    async updateReportsCount(options) {
      const { transaction } = options ?? {};
      return this.update({ reportsCount: await this.countReports({ where: { deletedAt: null }, transaction }) }, { transaction });
    }

    async updateDispatchedAgencies(options) {
      const { transaction } = options ?? {};
      const dispatches = await this.getDispatches({
        include: ['vehicle'],
        transaction,
      });
      const agencyIds = dispatches.map((d) => d.vehicle.createdByAgencyId).filter((v, i, a) => a.indexOf(v) === i);
      if (this.createdByAgencyId) {
        if (!agencyIds.includes(this.createdByAgencyId)) {
          agencyIds.push(this.createdByAgencyId);
        }
      }
      return this.setDispatchedAgencies(agencyIds, { transaction });
    }

    toJSON() {
      const attributes = { ...this.get() };
      return _.pick(attributes, [
        'id',
        'eventId',
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
          if (newValue?.match(/^\d+$/)) {
            const sort = BigInt(newValue);
            if (!Number.isNaN(sort)) {
              this.setDataValue('sort', sort);
              return;
            }
          }
          this.setDataValue('sort', null);
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

  Incident.afterSave(async (record, options) => {
    if (record.changed('createdByAgencyId')) {
      const { transaction } = options ?? {};
      await record.updateDispatchedAgencies({ transaction });
    }
  });

  return Incident;
};
