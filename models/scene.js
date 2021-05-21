const _ = require('lodash');
const { Model } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, DataTypes) => {
  class Scene extends Model {
    static associate(models) {
      Scene.hasMany(models.Responder, { as: 'responders' });
      Scene.hasMany(models.Responder.scope('latest'), {
        as: 'latestResponders',
      });
      Scene.hasMany(models.Patient, { as: 'patients' });
      Scene.hasMany(models.PatientObservation, { as: 'patientObservations' });
      Scene.hasMany(models.SceneObservation, { as: 'observations' });
      Scene.hasMany(models.ScenePin, { as: 'pins' });

      Scene.belongsTo(models.City, { as: 'city' });
      Scene.belongsTo(models.County, { as: 'county' });
      Scene.belongsTo(models.State, { as: 'state' });
      Scene.belongsTo(models.User, { as: 'updatedBy' });
      Scene.belongsTo(models.User, { as: 'createdBy' });
      Scene.belongsTo(models.User, { as: 'incidentCommander' });
      Scene.belongsTo(models.Agency, { as: 'updatedByAgency' });
      Scene.belongsTo(models.Agency, { as: 'createdByAgency' });
      Scene.belongsTo(models.Agency, { as: 'incidentCommanderAgency' });
    }

    static findNear(lat, lng, options = {}) {
      options.order = sequelize.literal(`"Facility".geog <-> ST_MakePoint(${lng}, ${lat})::geography`);
      return Scene.paginate(options);
    }

    static async start(user, agency, initialData, options) {
      /// confirm there's a corresponding Employment record
      const employment = await sequelize.models.Employment.findOne({
        where: { userId: user.id, agencyId: agency.id },
        transaction: options?.transaction,
      });
      if (!employment || !employment.isActive) {
        throw new Error();
      }
      /// filter and extend data
      const updatedAttributes = _.keys(initialData);
      _.pullAll(updatedAttributes, sequelize.models.SceneObservation.SYSTEM_ATTRIBUTES);
      const data = _.extend(
        {
          respondersCount: 1, /// the creating user is first on scene
          createdById: user.id,
          updatedById: user.id,
          incidentCommanderId: user.id,
          createdByAgencyId: agency.id,
          updatedByAgencyId: agency.id,
          incidentCommanderAgencyId: agency.id,
        },
        _.pick(initialData, updatedAttributes)
      );
      /// create the scene
      const scene = await Scene.create(data, options);
      /// create the corresponding first observation
      await sequelize.models.SceneObservation.create(
        _.extend(
          {
            sceneId: scene.id,
            updatedAttributes,
          },
          data
        ),
        options
      );
      /// add the user as an arrived first responder
      await sequelize.models.Responder.create(
        {
          sceneId: scene.id,
          userId: user.id,
          agencyId: agency.id,
          arrivedAt: new Date(),
          createdById: user.id,
          updatedById: user.id,
          createdByAgencyId: agency.id,
          updatedByAgencyId: agency.id,
        },
        options
      );
      return scene;
    }

    async close(options) {
      const data = {
        sceneId: this.id,
        closedAt: new Date(),
        createdById: this.incidentCommanderId,
        updatedById: this.incidentCommanderId,
        createdByAgencyId: this.incidentCommanderAgencyId,
        updatedByAgencyId: this.incidentCommanderAgencyId,
        updatedAttributes: ['closedAt'],
      };
      await sequelize.models.SceneObservation.create(data, options);
      await this.update(_.pick(data, ['closedAt', 'updatedById', 'updatedByAgencyId']), options);
    }

    async join(user, agency, options) {
      const [responder, created] = await sequelize.models.Responder.findOrCreate({
        where: {
          sceneId: this.id,
          userId: user.id,
          agencyId: agency.id,
          departedAt: null,
        },
        defaults: {
          arrivedAt: new Date(),
          createdById: user.id,
          updatedById: user.id,
          createdByAgencyId: agency.id,
          updatedByAgencyId: agency.id,
        },
        transaction: options?.transaction,
      });
      if (created) {
        await this.update(
          {
            respondersCount: await sequelize.models.Responder.count({
              where: {
                sceneId: this.id,
              },
              distinct: true,
              col: 'user_id',
              transaction: options?.transaction,
            }),
          },
          options
        );
      }
      return responder;
    }

    async leave(user, agency, options) {
      if (this.incidentCommanderId === user.id) {
        throw new Error();
      }
      const responder = await sequelize.models.Responder.findOne({
        where: {
          sceneId: this.id,
          userId: user.id,
          agencyId: agency.id,
          departedAt: null,
        },
        rejectOnEmpty: true,
        transaction: options?.transaction,
      });
      await responder.update(
        {
          departedAt: new Date(),
          updatedById: user.id,
          updatedByAgencyId: agency.id,
        },
        options
      );
      return responder;
    }

    async transferCommandTo(user, agency, options) {
      /// confirm this is a responder on scene
      const responder = await sequelize.models.Responder.findOne({
        where: { sceneId: this.id, userId: user.id, agencyId: agency.id },
        transaction: options?.transaction,
      });
      if (!responder) {
        throw new Error();
      }
      const data = {
        sceneId: this.id,
        incidentCommanderId: user.id,
        incidentCommanderAgencyId: agency.id,
        createdById: this.incidentCommanderId,
        updatedById: this.incidentCommanderId,
        createdByAgencyId: this.incidentCommanderAgencyId,
        updatedByAgencyId: this.incidentCommanderAgencyId,
        updatedAttributes: ['incidentCommanderId', 'incidentCommanderAgencyId'],
      };
      await sequelize.models.SceneObservation.create(data, options);
      await this.update(_.pick(data, ['incidentCommanderId', 'incidentCommanderAgencyId', 'updatedById', 'updatedByAgencyId']), options);
    }

    async updatePatientCounts(options) {
      this.patientsCount = await sequelize.models.Patient.count({
        where: { sceneId: this.id },
        transaction: options.transaction,
      });
      const priorityPatientsCounts = [0, 0, 0, 0, 0, 0];
      const results = await sequelize.models.Patient.findAll({
        group: ['priority'],
        attributes: ['priority', [sequelize.fn('COUNT', '*'), 'count']],
        where: { sceneId: this.id, isTransported: false },
        raw: true,
        transaction: options.transaction,
      });
      for (const result of results) {
        priorityPatientsCounts[result.priority] = parseInt(result.count, 10);
      }
      priorityPatientsCounts[5] =
        this.patientsCount - priorityPatientsCounts.reduce((previousValue, currentValue) => previousValue + currentValue);
      this.priorityPatientsCounts = priorityPatientsCounts;
      return this.save(options);
    }
  }

  Scene.init(
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
      approxPatientsCount: {
        type: DataTypes.INTEGER,
        field: 'approx_patients_count',
      },
      approxPriorityPatientsCounts: {
        type: DataTypes.JSONB,
        field: 'approx_priority_patients_counts',
      },
      patientsCount: {
        type: DataTypes.INTEGER,
        field: 'patients_count',
      },
      priorityPatientsCounts: {
        type: DataTypes.JSONB,
        field: 'priority_patients_counts',
      },
      respondersCount: {
        type: DataTypes.INTEGER,
        field: 'responders_count',
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
      isActive: {
        type: new DataTypes.VIRTUAL(DataTypes.BOOLEAN, ['closedAt']),
        get() {
          return !this.closedAt;
        },
      },
    },
    {
      sequelize,
      modelName: 'Scene',
      tableName: 'scenes',
      underscored: true,
    }
  );

  Scene.addScope('agency', (agencyId) => {
    return {
      where: { createdByAgencyId: agencyId },
      /// TODO add OR clause for MCIs in county and surrounding counties
    };
  });

  Scene.addScope('active', {
    where: { closedAt: null },
  });

  Scene.addScope('closed', {
    where: { closedAt: { [sequelize.Sequelize.Op.not]: null } },
  });

  sequelizePaginate.paginate(Scene);

  return Scene;
};
