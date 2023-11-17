const inflection = require('inflection');
const _ = require('lodash');
const xmlFormatter = require('xml-formatter');
const xmljs = require('xml-js');

const pkg = require('../package.json');

// const nemsisXsd = require('../lib/nemsis/xsd');
// const nemsisSchematron = require('../lib/nemsis/schematron');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Report extends Base {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Report.belongsTo(models.Version, { as: 'version' });
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

    async regenerate(options) {
      if (!options?.transaction) {
        return sequelize.transaction((transaction) => this.regenerate({ ...options, transaction }));
      }
      const { transaction } = options;
      const agency = this.createdByAgency ?? (await this.getCreatedByAgency(options));
      const version = this.version ?? (await this.getVersion(options));
      if (!agency || !version) {
        return Promise.resolve();
      }
      const doc = {
        EMSDataSet: {
          _attributes: {
            xmlns: 'http://www.nemsis.org',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            'xsi:schemaLocation': `http://www.nemsis.org https://nemsis.org/media/nemsis_v3/${version.nemsisVersion}/XSDs/NEMSIS_XSDs/EMSDataSet_v3.xsd`,
          },
          Header: {
            DemographicGroup: {
              'dAgency.01': {
                _text: agency.stateUniqueId,
              },
              'dAgency.02': {
                _text: agency.number,
              },
              'dAgency.04': {
                _text: agency.stateId,
              },
            },
            PatientCareReport: {
              _attributes: {
                UUID: this.canonicalId ?? this.id,
              },
              eRecord: {
                'eRecord.01': {
                  _text: this.canonicalId ?? this.id,
                },
                'eRecord.SoftwareApplicationGroup': {
                  'eRecord.02': {
                    _text: 'Peak Response Inc.',
                  },
                  'eRecord.03': {
                    _text: 'Peak Response',
                  },
                  'eRecord.04': {
                    _text: pkg.version,
                  },
                },
              },
            },
          },
        },
      };
      const models = [
        'Response',
        'Dispatch',
        'Time',
        'Patient',
        'Payment',
        'Scene',
        'Situation',
        'Injury',
        'Arrest',
        'History',
        'Narrative',
        'Vitals',
        'Protocols',
        'Medications',
        'Procedures',
        'Disposition',
        'Outcome',
        'File',
        'Signature',
      ];
      for (const modelName of models) {
        switch (modelName) {
          case 'Injury':
            break;
          case 'Arrest':
            break;
          case 'Payment':
            break;
          case 'Protocol':
            break;
          case 'Outcome':
            break;
          default: {
            // eslint-disable-next-line no-await-in-loop
            const r = this[modelName.toLowerCase()] ?? (await this[`get${modelName}`]?.(options));
            if (r) {
              let element = {};
              if (Array.isArray(r)) {
                switch (modelName) {
                  case 'File': // fallthrough
                  case 'Signature':
                    break;
                  default: {
                    element[sequelize.models[inflection.singularize(modelName)].groupTag] = r.map((record) => record.getData(version));
                  }
                }
              } else {
                element = r.getData(version);
              }
              doc.EMSDataSet.Header.PatientCareReport[`e${modelName}`] = element;
            }
          }
        }
      }
      const emsDataSet = xmlFormatter(xmljs.js2xml(doc, { compact: true }), {
        collapseContent: true,
        lineSeparator: '\n',
        indentation: '\t',
      });
      return this.update({ emsDataSet }, { transaction });
    }

    toJSON() {
      const attributes = { ...this.get() };
      return _.pick(attributes, [
        'id',
        'versionId',
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
      isCanonical: {
        type: DataTypes.VIRTUAL(DataTypes.BOOLEAN, ['canonicalId']),
        get() {
          return !this.canonicalId;
        },
      },
      pin: DataTypes.STRING,
      data: DataTypes.JSONB,
      updatedAttributes: DataTypes.JSONB,
      updatedDataAttributes: DataTypes.JSONB,
      isValid: DataTypes.BOOLEAN,
      validationErrors: DataTypes.JSONB,
      medicationIds: DataTypes.JSONB,
      procedureIds: DataTypes.JSONB,
      vitalIds: DataTypes.JSONB,
      fileIds: DataTypes.JSONB,
      signatureIds: DataTypes.JSONB,
      ringdownId: DataTypes.STRING,
      predictions: DataTypes.JSONB,
      emsDataSet: DataTypes.TEXT,
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
