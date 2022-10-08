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
      Report.belongsToMany(models.Signature, { as: 'signatures', through: 'reports_signatures', timestamps: false });

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
          'signatureIds',
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
        Disposition: new Set(),
        File: new Set(),
        History: new Set(),
        Narrative: new Set(),
        Medication: new Set(),
        Patient: new Set(),
        Procedure: new Set(),
        Response: new Set(),
        Scene: new Set(),
        Signature: new Set(),
        Situation: new Set(),
        Time: new Set(),
        Vital: new Set(),
        // the following are dependencies of above
        Facility: new Set(),
        Form: new Set(),
        City: new Set(),
        State: new Set(),
      };
      for (const report of reports) {
        payload.Report.push(report.toJSON());
        ids.Response.add(report.responseId);
        ids.Scene.add(report.sceneId);
        ids.Time.add(report.timeId);
        ids.Patient.add(report.patientId);
        ids.Situation.add(report.situationId);
        ids.History.add(report.historyId);
        ids.Disposition.add(report.dispositionId);
        ids.Narrative.add(report.narrativeId);
        report.medicationIds.forEach(ids.Medication.add, ids.Medication);
        report.procedureIds.forEach(ids.Procedure.add, ids.Procedure);
        report.vitalIds.forEach(ids.Vital.add, ids.Vital);
        report.fileIds.forEach(ids.File.add, ids.File);
        report.signatureIds.forEach(ids.Signature.add, ids.Signature);
      }
      for (const model of [
        'Disposition',
        'File',
        'History',
        'Narrative',
        'Medication',
        'Patient',
        'Procedure',
        'Response',
        'Scene',
        'Signature',
        'Situation',
        'Time',
        'Vital',
        // order matters, the following are dependencies of above
        'Facility',
        'Form',
        'City',
        'State',
      ]) {
        // eslint-disable-next-line no-await-in-loop
        const records = await sequelize.models[model].findAll({ where: { id: [...ids[model]] }, transaction });
        payload[model] = records.map((record) => record.toJSON());
        switch (model) {
          case 'Disposition':
            records.map((d) => d.destinationFacilityId).forEach((id) => ids.Facility.add(id));
            break;
          case 'Facility': // fallthrough
          case 'Scene':
            records.map((obj) => obj.cityId).forEach((id) => ids.City.add(id));
            records.map((obj) => obj.stateId).forEach((id) => ids.State.add(id));
            break;
          case 'Signature':
            records.map((obj) => obj.formId).forEach((id) => ids.Form.add(id));
            break;
          default:
            break;
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
        'filterPriority',
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
        'signatureIds',
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
      filterPriority: {
        type: DataTypes.VIRTUAL(DataTypes.INTEGER),
        get() {
          return this.disposition?.destinationFacilityId ? sequelize.models.Patient.Priority.TRANSPORTED : this.patient?.priority;
        },
      },
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
      signatureIds: {
        type: DataTypes.JSONB,
        field: 'signature_ids',
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
