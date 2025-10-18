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

    updatePatientsCounts({ transaction }) {
      // ensure we're starting from the canonical record
      // get the incident
      // query canonical reports for the incident, by priority
      // then by priority and filterPriority for transported patients
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
          return this.isMCI && !this.closedAt;
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
    if (record.changed('approxPriorityPatientsCounts')) {
      let approxPatientsCount = 0;
      for (let i = 0; i < 5; i += 1) {
        approxPatientsCount += record.approxPriorityPatientsCounts[i];
      }
      record.approxPatientsCount = approxPatientsCount;
      record.changed('approxPatientsCount', true);
      options.fields = options.fields || [];
      if (options.fields.indexOf('approxPatientsCount') < 0) {
        options.fields.push('approxPatientsCount');
      }
      record.updatedAttributes?.splice(record.updatedAttributes.indexOf('approxPriorityPatientsCounts'), 0, 'approxPatientsCount');
    }
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
