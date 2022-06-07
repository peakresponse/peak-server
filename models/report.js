const _ = require('lodash');

const { Base } = require('./base');
const nemsis = require('../lib/nemsis');

module.exports = (sequelize, DataTypes) => {
  class Report extends Base {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Report.belongsTo(Report, { as: 'canonical' });
      Report.belongsTo(Report, { as: 'current' });
      Report.belongsTo(Report, { as: 'parent' });
      Report.belongsTo(Report, { as: 'secondParent' });
      Report.belongsTo(models.User, { as: 'createdBy' });
      Report.belongsTo(models.User, { as: 'updatedBy' });
      Report.belongsTo(models.Agency, { as: 'createdByAgency' });
      Report.belongsTo(models.Agency, { as: 'updatedByAgency' });

      Report.belongsTo(models.Incident, { as: 'incident' });
      Report.belongsTo(models.Response, { as: 'response' });
      Report.belongsTo(models.Scene, { as: 'scene' });
      Report.belongsTo(models.Time, { as: 'time' });
      Report.belongsTo(models.Patient, { as: 'patient' });
      Report.belongsTo(models.Situation, { as: 'situation' });
      Report.belongsTo(models.History, { as: 'history' });
      Report.belongsTo(models.Disposition, { as: 'disposition' });
      Report.belongsTo(models.Narrative, { as: 'narrative' });
      Report.belongsToMany(models.Medication, { as: 'medications', through: 'reports_medications', timestamps: false });
      Report.belongsToMany(models.Procedure, { as: 'procedures', through: 'reports_procedures', timestamps: false });
      Report.belongsToMany(models.Vital, { as: 'vitals', through: 'reports_vitals', timestamps: false });
      Report.belongsToMany(models.File, { as: 'files', through: 'reports_files', timestamps: false });

      Report.hasMany(Report, { as: 'versions', foreignKey: 'canonicalId' });
    }

    static async createOrUpdate(user, agency, data, options) {
      return Base.createOrUpdate(
        Report,
        user,
        agency,
        data,
        ['incidentId'],
        [
          'pin',
          'data',
          'responseId',
          'sceneId',
          'timeId',
          'patientId',
          'situationId',
          'historyId',
          'medicationIds',
          'vitalIds',
          'procedureIds',
          'dispositionId',
          'narrativeId',
          'fileIds',
          'ringdownId',
          'predictions',
        ],
        options
      );
    }

    static async createPayload(reports, options = {}) {
      const { transaction } = options;
      const payload = {
        Report: [],
      };
      const ids = {
        Response: [],
        Scene: [],
        Time: [],
        Patient: [],
        Situation: [],
        History: [],
        Disposition: [],
        Narrative: [],
        Medication: [],
        Procedure: [],
        Vital: [],
        File: [],
      };
      for (const report of reports) {
        payload.Report.push(report.toJSON());
        ids.Response.push(report.responseId);
        ids.Scene.push(report.sceneId);
        ids.Time.push(report.timeId);
        ids.Patient.push(report.patientId);
        ids.Situation.push(report.situationId);
        ids.History.push(report.historyId);
        ids.Disposition.push(report.dispositionId);
        ids.Narrative.push(report.narrativeId);
        ids.Medication = ids.Medication.concat(report.medicationIds);
        ids.Procedure = ids.Procedure.concat(report.procedureIds);
        ids.Vital = ids.Vital.concat(report.vitalIds);
        ids.File = ids.File.concat(report.fileIds);
      }
      for (const model of [
        'Response',
        'Scene',
        'Time',
        'Patient',
        'Situation',
        'History',
        'Disposition',
        'Narrative',
        'Medication',
        'Procedure',
        'Vital',
        'File',
      ]) {
        // eslint-disable-next-line no-await-in-loop
        const records = await sequelize.models[model].findAll({ where: { id: ids[model] }, transaction });
        payload[model] = records.map((record) => record.toJSON());
        if (model === 'Scene') {
          payload.City = [];
          payload.State = [];
          const cityIds = [];
          const stateIds = [];
          for (const scene of records) {
            if (scene.city) {
              payload.City = scene.city.toJSON();
            } else if (scene.cityId) {
              cityIds.push(scene.cityId);
            }
            if (scene.state) {
              payload.State = scene.state.toJSON();
            } else if (scene.stateId) {
              stateIds.push(scene.stateId);
            }
          }
          if (cityIds.length > 0) {
            // eslint-disable-next-line no-await-in-loop
            payload.City = (await sequelize.models.City.findAll({ where: { id: cityIds }, transaction })).map((c) => c.toJSON());
          }
          if (stateIds.length > 0) {
            // eslint-disable-next-line no-await-in-loop
            payload.State = (await sequelize.models.State.findAll({ where: { id: stateIds }, transaction })).map((s) => s.toJSON());
          }
        }
      }
      return payload;
    }

    toJSON() {
      const attributes = { ...this.get() };
      return _.pick(attributes, [
        'id',
        'canonicalId',
        'currentId',
        'parentId',
        'incidentId',
        'pin',
        'sceneId',
        'responseId',
        'timeId',
        'patientId',
        'situationId',
        'historyId',
        'medicationIds',
        'vitalIds',
        'procedureIds',
        'dispositionId',
        'narrativeId',
        'fileIds',
        'ringdownId',
        'predictions',
        'data',
        'isValid',
        'createdAt',
        'createdById',
        'createdByAgencyId',
        'updatedAt',
        'updatedById',
      ]);
    }
  }

  Report.init(
    {
      pin: {
        type: DataTypes.STRING,
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
      isCanonical: {
        type: DataTypes.VIRTUAL(DataTypes.BOOLEAN, ['canonicalId']),
        get() {
          return !this.canonicalId;
        },
      },
      isValid: {
        type: DataTypes.BOOLEAN,
        field: 'is_valid',
      },
      validationErrors: {
        type: DataTypes.JSONB,
        field: 'validation_errors',
      },
      medicationIds: {
        type: DataTypes.JSONB,
        field: 'medication_ids',
      },
      procedureIds: {
        type: DataTypes.JSONB,
        field: 'procedure_ids',
      },
      vitalIds: {
        type: DataTypes.JSONB,
        field: 'vital_ids',
      },
      fileIds: {
        type: DataTypes.JSONB,
        field: 'file_ids',
      },
      ringdownId: {
        type: DataTypes.STRING,
        field: 'ringdown_id',
      },
      predictions: {
        type: DataTypes.JSONB,
      },
    },
    {
      sequelize,
      modelName: 'Report',
      tableName: 'reports',
      underscored: true,
      validate: {
        id() {
          if (this.isCanonical) {
            // make sure this canonical record has its id set as the record id
            if (this.id !== this.getFirstNemsisValue(['eRecord.01'])) {
              throw new Error();
            }
          }
        },
        async schema() {
          this.validationErrors = await nemsis.validateSchema('eRecord_v3.xsd', 'eRecord', null, this.data);
          this.isValid = this.validationErrors === null;
        },
      },
    }
  );

  Report.addScope('canonical', {
    where: {
      canonicalId: null,
    },
  });

  Report.afterCreate(async (record, options) => {
    if (record.isCanonical) {
      const incident = await record.getIncident(options);
      await incident?.updateReportsCount(options);
    }
  });

  return Report;
};
