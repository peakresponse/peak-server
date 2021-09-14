const sequelizePaginate = require('sequelize-paginate');
const uuid = require('uuid');

const nemsis = require('../lib/nemsis');
const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Scene extends Base {
    static associate(models) {
      Scene.belongsTo(Scene, { as: 'canonical' });
      Scene.belongsTo(Scene, { as: 'current' });
      Scene.belongsTo(Scene, { as: 'parent' });
      Scene.belongsTo(Scene, { as: 'secondParent' });
      Scene.hasMany(Scene, { as: 'versions', foreignKey: 'canonicalId' });

      Scene.hasMany(models.Responder, { as: 'responders' });
      Scene.hasMany(models.Responder.scope('latest'), {
        as: 'latestResponders',
      });
      Scene.hasMany(models.Patient, { as: 'patients', foreignKey: 'sceneId' });
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

    static createOrUpdate(user, agency, data, options) {
      return Base.createOrUpdate(
        Scene,
        user,
        agency,
        data,
        [],
        [
          'name',
          'desc',
          'urgency',
          'note',
          'approxPatientsCount',
          'isMCI',
          'lat',
          'lng',
          'geog',
          'address1',
          'address2',
          'cityId',
          'countyId',
          'stateId',
          'zip',
          'closedAt',
          'incidentCommanderId',
          'incidentCommanderAgencyId',
          'approxPriorityPatientsCounts',
          'data',
        ],
        options
      );
    }

    static async start(user, agency, initialData, options) {
      if (!options?.transaction) {
        return sequelize.transaction((transaction) => Scene.start(user, agency, initialData, { ...options, transaction }));
      }
      /// confirm there's a corresponding Employment record
      const employment = await sequelize.models.Employment.findOne({
        where: { userId: user.id, agencyId: agency.id },
        transaction: options?.transaction,
      });
      if (!employment || !employment.isActive) {
        throw new Error();
      }
      const [scene, created] = await Scene.createOrUpdate(
        user,
        agency,
        {
          ...initialData,
          incidentCommanderId: user.id,
          incidentCommanderAgencyId: agency.id,
        },
        options
      );
      /// add the user as an arrived first responder
      await sequelize.models.Responder.create(
        {
          sceneId: scene.canonicalId,
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
      await Scene.update(
        { respondersCount: 1 },
        {
          where: {
            id: scene.canonicalId,
          },
          transaction: options.transaction,
        }
      );
      return [scene, created];
    }

    async close(user, agency, options) {
      if (this.canonicalId || user.id !== this.incidentCommanderId || agency.id !== this.incidentCommanderAgencyId) {
        throw new Error();
      }
      if (!options?.transaction) {
        return sequelize.transaction((transaction) => this.close(user, agency, { ...options, transaction }));
      }
      return Scene.createOrUpdate(
        user,
        agency,
        {
          id: uuid.v4(),
          parentId: this.currentId,
          closedAt: new Date(),
        },
        options
      );
    }

    async join(user, agency, options) {
      if (this.canonicalId) {
        throw new Error();
      }
      if (!options?.transaction) {
        return sequelize.transaction((transaction) => this.join(user, agency, { ...options, transaction }));
      }
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
        transaction: options.transaction,
      });
      if (created) {
        await this.updateRespondersCount(options);
      }
      return responder;
    }

    async leave(user, agency, options) {
      if (this.canonicalId || this.incidentCommanderId === user.id) {
        throw new Error();
      }
      if (!options?.transaction) {
        return sequelize.transaction((transaction) => this.leave(user, agency, { ...options, transaction }));
      }
      const responder = await sequelize.models.Responder.findOne({
        where: {
          sceneId: this.id,
          userId: user.id,
          agencyId: agency.id,
          departedAt: null,
        },
        rejectOnEmpty: true,
        transaction: options.transaction,
      });
      await responder.update(
        {
          departedAt: new Date(),
          updatedById: user.id,
          updatedByAgencyId: agency.id,
        },
        options
      );
      await this.updateRespondersCount(options);
      return responder;
    }

    async transferCommandTo(user, agency, options) {
      if (this.canonicalId) {
        throw new Error();
      }
      if (!options?.transaction) {
        return sequelize.transaction((transaction) => this.transferCommandTo(user, agency, { ...options, transaction }));
      }
      /// confirm this is a responder on scene
      const responder = await sequelize.models.Responder.findOne({
        where: { sceneId: this.id, userId: user.id, agencyId: agency.id, departedAt: null },
        transaction: options.transaction,
      });
      if (!responder) {
        throw new Error();
      }
      return Scene.createOrUpdate(
        user,
        agency,
        {
          id: uuid.v4(),
          parentId: this.currentId,
          incidentCommanderId: user.id,
          incidentCommanderAgencyId: agency.id,
        },
        options
      );
    }

    async updateRespondersCount(options) {
      if (this.canonicalId) {
        throw new Error();
      }
      return this.update(
        {
          respondersCount: await sequelize.models.Responder.count({
            where: {
              sceneId: this.id,
              departedAt: null,
            },
            distinct: true,
            col: 'user_id',
            transaction: options.transaction,
          }),
        },
        options
      );
    }

    async updatePatientCounts(options) {
      if (this.canonicalId) {
        throw new Error();
      }
      this.patientsCount = await sequelize.models.Patient.scope('canonical').count({
        where: { sceneId: this.id },
        transaction: options.transaction,
      });
      const priorityPatientsCounts = [0, 0, 0, 0, 0, 0];
      const results = await sequelize.models.Patient.scope('canonical').findAll({
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
      data: DataTypes.JSONB,
      updatedAttributes: {
        type: DataTypes.JSONB,
        field: 'updated_attributes',
      },
      updatedDataAttributes: {
        type: DataTypes.JSONB,
        field: 'updated_data_attributes',
      },
      isValid: {
        type: DataTypes.BOOLEAN,
        field: 'is_valid',
      },
      validationErrors: {
        type: DataTypes.JSONB,
        field: 'validation_errors',
      },
    },
    {
      sequelize,
      modelName: 'Scene',
      tableName: 'scenes',
      underscored: true,
      validate: {
        async schema() {
          this.validationErrors = await nemsis.validateSchema('eScene_v3.xsd', 'eScene', null, this.data);
          this.isValid = this.validationErrors === null;
        },
      },
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

  Scene.addScope('canonical', {
    where: { canonicalId: null },
  });

  Scene.addScope('closed', {
    where: { closedAt: { [sequelize.Sequelize.Op.not]: null } },
  });

  Scene.addScope('latest', {
    include: [{ model: Scene, as: 'versions', where: { id: null }, required: false }],
  });

  sequelizePaginate.paginate(Scene);

  return Scene;
};
