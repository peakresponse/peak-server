const _ = require('lodash');
const sequelizePaginate = require('sequelize-paginate');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Scene extends Base {
    static get xsdPath() {
      return 'eScene_v3.xsd';
    }

    static get rootTag() {
      return 'eScene';
    }

    static associate(models) {
      Scene.belongsTo(Scene, { as: 'canonical' });
      Scene.belongsTo(Scene, { as: 'current' });
      Scene.belongsTo(Scene, { as: 'parent' });
      Scene.belongsTo(Scene, { as: 'secondParent' });
      Scene.hasMany(Scene, { as: 'versions', foreignKey: 'canonicalId' });

      Scene.hasOne(models.Incident, { as: 'incident', foreignKey: 'sceneId' });

      Scene.hasMany(models.Patient, { as: 'patients', foreignKey: 'sceneId' });
      Scene.hasMany(models.Responder, { as: 'responders', foreignKey: 'sceneId' });
      Scene.hasMany(models.ScenePin, { as: 'pins' });

      Scene.belongsTo(models.City, { as: 'city' });
      Scene.belongsTo(models.County, { as: 'county' });
      Scene.belongsTo(models.State, { as: 'state' });
      Scene.belongsTo(models.Responder, { as: 'mgsResponder' });
      Scene.belongsTo(models.Responder, { as: 'triageResponder' });
      Scene.belongsTo(models.Responder, { as: 'treatmentResponder' });
      Scene.belongsTo(models.Responder, { as: 'stagingResponder' });
      Scene.belongsTo(models.Responder, { as: 'transportResponder' });
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
          'patientsCount',
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
          'mgsResponderId',
          'triageResponderId',
          'treatmentResponderId',
          'stagingResponderId',
          'transportResponderId',
          'approxPriorityPatientsCounts',
          'priorityPatientsCounts',
          'transpPriorityPatientsCounts',
          'data',
        ],
        options,
      );
    }

    toJSON() {
      const attributes = { ...this.get() };
      return _.pick(attributes, [
        'id',
        'canonicalId',
        'currentId',
        'parentId',
        'data',
        'createdAt',
        'createdById',
        'createdByAgencyId',
        'updatedAt',
        'updatedById',
        'updatedByAgencyId',
        'name',
        'desc',
        'urgency',
        'note',
        'lat',
        'lng',
        'geog',
        'address1',
        'address2',
        'cityId',
        'countyId',
        'stateId',
        'zip',
        'isMCI',
        'isActive',
        'approxPatientsCount',
        'approxPriorityPatientsCounts',
        'patientsCount',
        'priorityPatientsCounts',
        'transpPatientsCount',
        'transpPriorityPatientsCounts',
        'closedAt',
        'incidentCommanderId',
        'incidentCommanderAgencyId',
        'mgsResponderId',
        'triageResponderId',
        'treatmentResponderId',
        'stagingResponderId',
        'transportResponderId',
      ]);
    }

    updatePatientsCounts(countAttr, priorityCountsAttr, options) {
      if (this.changed(priorityCountsAttr)) {
        let patientsCount = 0;
        for (let i = 0; i < 5; i += 1) {
          patientsCount += this[priorityCountsAttr][i];
        }
        this[countAttr] = patientsCount;
        this.changed(countAttr, true);
        options.fields = options.fields || [];
        if (options.fields.indexOf(countAttr) < 0) {
          options.fields.push(countAttr);
        }
        this.updatedAttributes?.splice(this.updatedAttributes.indexOf(priorityCountsAttr), 0, countAttr);
      }
    }
  }

  Scene.init(
    {
      name: DataTypes.STRING,
      desc: DataTypes.TEXT,
      urgency: DataTypes.TEXT,
      note: DataTypes.TEXT,
      approxPatientsCount: DataTypes.INTEGER,
      approxPriorityPatientsCounts: DataTypes.JSONB,
      patientsCount: DataTypes.INTEGER,
      priorityPatientsCounts: DataTypes.JSONB,
      transpPatientsCount: DataTypes.INTEGER,
      transpPriorityPatientsCounts: DataTypes.JSONB,
      respondersCount: DataTypes.INTEGER,
      isMCI: {
        type: DataTypes.BOOLEAN,
        field: 'is_mci',
      },
      lat: DataTypes.STRING,
      lng: DataTypes.STRING,
      geog: DataTypes.GEOGRAPHY,
      address1: DataTypes.STRING,
      address2: DataTypes.STRING,
      zip: DataTypes.STRING,
      closedAt: DataTypes.DATE,
      isActive: {
        type: new DataTypes.VIRTUAL(DataTypes.BOOLEAN, ['closedAt']),
        get() {
          return this.isMCI && !this.closedAt;
        },
      },
      data: DataTypes.JSONB,
      updatedAttributes: DataTypes.JSONB,
      updatedDataAttributes: DataTypes.JSONB,
      isValid: DataTypes.BOOLEAN,
      validationErrors: DataTypes.JSONB,
      isCanonical: {
        type: DataTypes.VIRTUAL(DataTypes.BOOLEAN, ['canonicalId']),
        get() {
          return !this.canonicalId;
        },
      },
    },
    {
      sequelize,
      modelName: 'Scene',
      tableName: 'scenes',
      underscored: true,
    },
  );

  Scene.beforeValidate(async (record, options) => {
    record.syncFieldAndNemsisBooleanValue('isMCI', ['eScene.07'], options, true);
    record.syncFieldAndNemsisValue('address1', ['eScene.15'], options);
    record.syncFieldAndNemsisValue('address2', ['eScene.16'], options);
    record.syncFieldAndNemsisValue('cityId', ['eScene.17'], options);
    record.syncFieldAndNemsisValue('stateId', ['eScene.18'], options, true);
    record.syncFieldAndNemsisValue('zip', ['eScene.19'], options, true);
    record.syncFieldAndNemsisValue('countyId', ['eScene.21'], options, true);
    // placeholders for required eScene fields
    [['eScene.01'], ['eScene.06'], ['eScene.08'], ['eScene.09']].forEach((e) => {
      if (!_.get(record.data, [e])) {
        _.set(record.data, [e], {
          _attributes: {
            NV: '7701003',
            'xsi:nil': 'true',
          },
        });
        record.changed('data', true);
        options.fields = options.fields || [];
        if (options.fields.indexOf('data') < 0) {
          options.fields.push('data');
        }
      }
    });
    // update patients counter caches
    record.updatePatientsCounts('approxPatientsCount', 'approxPriorityPatientsCounts', options);
    record.updatePatientsCounts('patientsCount', 'priorityPatientsCounts', options);
    record.updatePatientsCounts('transpPatientsCount', 'transpPriorityPatientsCounts', options);
  });

  Scene.addScope('agency', (agencyId) => ({
    where: { createdByAgencyId: agencyId },
    /// TODO add OR clause for MCIs in county and surrounding counties
  }));

  Scene.addScope('active', {
    where: { isMCI: true, closedAt: null },
  });

  Scene.addScope('canonical', {
    where: { canonicalId: null },
  });

  Scene.addScope('closed', {
    where: { isMCI: true, closedAt: { [sequelize.Sequelize.Op.not]: null } },
  });

  Scene.addScope('latest', {
    include: [{ model: Scene, as: 'versions', where: { id: null }, required: false }],
  });

  sequelizePaginate.paginate(Scene);

  return Scene;
};
