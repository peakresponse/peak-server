const inflection = require('inflection');
const _ = require('lodash');
const fs = require('fs/promises');
const sequelizePaginate = require('sequelize-paginate');
const tmp = require('tmp-promise');
const xmlFormatter = require('xml-formatter');
const xmljs = require('xml-js');

const pkg = require('../package.json');

const nemsisXsd = require('../lib/nemsis/xsd');
const nemsisSchematron = require('../lib/nemsis/schematron');

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
          'deletedAt',
        ],
        options,
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

    async nemsisValidate(options) {
      if (this.isCanonical) {
        const current = await Report.unscoped().findByPk(this.currentId, options);
        return current.nemsisValidate(options);
      }
      if (!options?.transaction) {
        return sequelize.transaction((transaction) => this.nemsisValidate({ ...options, transaction }));
      }
      const { transaction } = options;
      const version = this.version ?? (await this.getVersion({ transaction }));
      if (!version) {
        return Promise.resolve();
      }
      // get the js equivalent to the XML
      const doc = xmljs.xml2js(this.emsDataSet, { compact: true });
      // run the EMS Data Set through XSD validation
      let validationErrors = await nemsisXsd.validateEmsDataSet(version.nemsisVersion, this.emsDataSet, doc);
      // run the EMS Data Set through national Schematron validation
      if (!validationErrors) {
        validationErrors = await nemsisSchematron.validateEmsDataSet(version.nemsisVersion, this.emsDataSet, doc);
      }
      // run the EMS Data Set through state/additional Schematron validation
      if (!validationErrors && version.emsSchematronIds?.length) {
        const schematrons = await sequelize.models.NemsisSchematron.findAll({ where: { id: version.emsSchematronIds } });
        for (const schematron of schematrons) {
          // eslint-disable-next-line no-await-in-loop
          validationErrors = await schematron.nemsisValidate(this.emsDataSet, doc);
          if (validationErrors) {
            break;
          }
        }
      }
      let isValid = true;
      if (validationErrors) {
        // for each error, idenfity the model and id for the record it comes from
        // for schematron errors, set on the model object with appropriate path so it will be displayed on edit
        for (const error of validationErrors.$json.errors) {
          isValid = isValid && error.level === 'warning';
        }
      }
      return this.update({ isValid, validationErrors: validationErrors?.$json ?? null }, { transaction });
    }

    async regenerate(options) {
      if (this.isCanonical) {
        const current = await this.getCurrent(options);
        return current.regenerate(options);
      }
      if (!options?.transaction) {
        return sequelize.transaction((transaction) => this.regenerate({ ...options, transaction }));
      }
      const { transaction } = options;
      const agency = this.createdByAgency ?? (await this.getCreatedByAgency(options));
      const version = this.version ?? (await this.getVersion(options)) ?? agency?.version ?? (await agency?.getVersion(options));
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
        'Files',
        'Signatures',
      ];
      const { PatientCareReport } = doc.EMSDataSet.Header;
      for (const modelName of models) {
        switch (modelName) {
          case 'Dispatch':
            PatientCareReport.eDispatch = {
              'eDispatch.01': {
                _text: '2301051',
              },
              'eDispatch.02': {
                _attributes: {
                  NV: '7701003',
                  'xsi:nil': 'true',
                },
              },
            };
            break;
          case 'Injury':
            PatientCareReport.eInjury = {};
            ['eInjury.01', 'eInjury.03', 'eInjury.04'].forEach((e) => {
              PatientCareReport.eInjury[e] = {
                _attributes: {
                  NV: '7701003',
                  'xsi:nil': 'true',
                },
              };
            });
            break;
          case 'Arrest':
            PatientCareReport.eArrest = {};
            [
              'eArrest.01',
              'eArrest.02',
              'eArrest.03',
              'eArrest.04',
              'eArrest.07',
              'eArrest.09',
              'eArrest.11',
              'eArrest.12',
              'eArrest.14',
              'eArrest.16',
              'eArrest.17',
              'eArrest.18',
              'eArrest.20',
              'eArrest.21',
              'eArrest.22',
            ].forEach((e) => {
              PatientCareReport.eArrest[e] = {
                _attributes: {
                  NV: '7701003',
                  'xsi:nil': 'true',
                },
              };
            });
            break;
          case 'Payment':
            PatientCareReport.ePayment = {};
            ['ePayment.01', 'ePayment.50'].forEach((e) => {
              PatientCareReport.ePayment[e] = {
                _attributes: {
                  NV: '7701003',
                  'xsi:nil': 'true',
                },
              };
            });
            break;
          case 'Protocols':
            PatientCareReport.eProtocols = {
              'eProtocols.ProtocolGroup': {
                'eProtocols.01': {
                  _attributes: {
                    NV: '7701003',
                    'xsi:nil': 'true',
                  },
                },
              },
            };
            break;
          case 'Outcome':
            PatientCareReport.eOutcome = {};
            [
              '["eOutcome.01"]',
              '["eOutcome.02"]',
              '["eOutcome.EmergencyDepartmentProceduresGroup"]["eOutcome.09"]',
              '["eOutcome.EmergencyDepartmentProceduresGroup"]["eOutcome.19"]',
              '["eOutcome.10"]',
              '["eOutcome.11"]',
              '["eOutcome.HospitalProceduresGroup"]["eOutcome.12"]',
              '["eOutcome.HospitalProceduresGroup"]["eOutcome.20"]',
              '["eOutcome.13"]',
              '["eOutcome.16"]',
              '["eOutcome.18"]',
            ].forEach((e) => {
              _.set(
                PatientCareReport.eOutcome,
                e,
                {
                  _attributes: {
                    NV: '7701003',
                    'xsi:nil': 'true',
                  },
                },
                Object,
              );
              if (e === '["eOutcome.02"]' && !!this.pin) {
                PatientCareReport.eOutcome['eOutcome.ExternalDataGroup'] = {
                  'eOutcome.03': {
                    _text: '4303001',
                  },
                  'eOutcome.04': {
                    _text: this.pin,
                  },
                };
              }
            });
            break;
          default: {
            // eslint-disable-next-line no-await-in-loop
            let r = this[modelName.toLowerCase()] ?? (await this[`get${modelName}`]?.(options));
            if (!this[modelName.toLowerCase()]) {
              this[modelName.toLowerCase()] = r;
            }
            const modelClass = sequelize.models[inflection.singularize(modelName)];
            if (r) {
              let element = {};
              if (Array.isArray(r)) {
                // eslint-disable-next-line no-await-in-loop
                element[modelClass.groupTag] = await Promise.all(r.map((record) => record.getData(version)));
              } else {
                if (modelName === 'Scene' && r.isMCI) {
                  // ensure we're working with the latest scene data
                  // eslint-disable-next-line no-await-in-loop
                  r = await r.getCanonical(options);
                  // inject additional separate MCI related fields
                  const priority = this.patient.priority ?? null;
                  if (priority !== null) {
                    r.setNemsisValue(['eScene.08'], sequelize.models.Patient.NemsisPatientPriorities[priority], true);
                  }
                }
                // eslint-disable-next-line no-await-in-loop
                element = await r.getData(version);
              }
              PatientCareReport[modelClass.rootTag] = _.merge(PatientCareReport[modelClass.rootTag] ?? {}, element);
            }
          }
        }
      }
      // generate XML, with file placeholders
      const emsDataSet = xmlFormatter(xmljs.js2xml(doc, { compact: true }), {
        collapseContent: true,
        lineSeparator: '\n',
        indentation: '\t',
      });
      // write to a tmp file
      const tmpFile = await tmp.file({ postfix: 'ems-data-set.xml' });
      await fs.writeFile(tmpFile.path, emsDataSet);
      // insert base64 encoded files
      for (const modelName of ['Files']) {
        const records = this[modelName.toLowerCase()]; // note that these _will_ already be fetched above
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(records.map((record) => record.insertFileInto(tmpFile.path)));
      }
      // upload as file attachment
      const emsDataSetFile = await Base.uploadAssetFile(tmpFile.path);
      await tmpFile.cleanup();
      return this.update({ emsDataSet, emsDataSetFile }, { transaction });
    }

    toIntegrationJSON() {
      const attributes = { ...this.get() };
      return _.pick(attributes, [
        'id',
        'incidentNumber',
        'unit',
        'pin',
        'patientName',
        'patientAge',
        'patientAgeUnits',
        'patientGender',
        'deletedAt',
        'createdAt',
        'updatedAt',
      ]);
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
        'deletedAt',
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
      isCanonical: {
        type: DataTypes.VIRTUAL(DataTypes.BOOLEAN, ['canonicalId']),
        get() {
          return !this.canonicalId;
        },
      },
      pin: DataTypes.STRING,
      priority: DataTypes.INTEGER,
      filterPriority: DataTypes.INTEGER,
      incidentNumber: {
        type: DataTypes.VIRTUAL(DataTypes.STRING),
        get() {
          return this.incident?.number;
        },
      },
      unit: {
        type: DataTypes.VIRTUAL(DataTypes.STRING),
        get() {
          return this.response?.unit;
        },
      },
      patientName: {
        type: DataTypes.VIRTUAL(DataTypes.STRING),
        get() {
          return this.patient?.name;
        },
      },
      patientAge: {
        type: DataTypes.VIRTUAL(DataTypes.STRING),
        get() {
          return this.patient?.age;
        },
      },
      patientAgeUnits: {
        type: DataTypes.VIRTUAL(DataTypes.STRING),
        get() {
          return this.patient?.ageUnits;
        },
      },
      patientGender: {
        type: DataTypes.VIRTUAL(DataTypes.STRING),
        get() {
          return this.patient?.gender;
        },
      },
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
      deletedAt: DataTypes.DATE,
      isDeleted: {
        type: DataTypes.VIRTUAL(DataTypes.BOOLEAN, ['deletedAt']),
        get() {
          return !!this.deletedAt;
        },
      },
      emsDataSet: DataTypes.TEXT,
      emsDataSetFile: DataTypes.STRING,
      emsDataSetFileUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.assetUrl('emsDataSetFile');
        },
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
      },
      defaultScope: {
        attributes: {
          exclude: ['emsDataSet', 'emsDataSetFile', 'emsDataSetFileUrl'],
        },
      },
    },
  );

  Report.addScope('canonical', {
    where: {
      canonicalId: null,
    },
  });

  Report.beforeValidate(async (record, options) => {
    const { transaction } = options;
    const patient = record.patient || (await record.getPatient({ transaction }));
    const disposition = record.disposition || (await record.getDisposition({ transaction }));
    record.priority = patient?.priority;
    if (record.isDeleted) {
      record.filterPriority = sequelize.models.Patient.Priority.DELETED;
    } else if (disposition?.destinationFacilityId) {
      record.filterPriority = sequelize.models.Patient.Priority.TRANSPORTED;
    } else {
      record.filterPriority = record.priority;
    }
    if (record.changed('priority')) {
      options.fields?.push('priority');
    }
    if (record.changed('filterPriority')) {
      options.fields?.push('filterPriority');
    }
  });

  Report.afterCreate(async (record, options) => {
    if (record.isCanonical) {
      const incident = await record.getIncident(options);
      await incident?.updateReportsCount(options);
    }
  });

  Report.afterSave(async (record, options) => {
    if (record.isCanonical) {
      if (record.changed('deletedAt')) {
        const incident = await record.getIncident(options);
        await incident?.updateReportsCount(options);
      }
      return;
    }
    await record.handleAssetFile('emsDataSetFile', options);
  });

  sequelizePaginate.paginate(Report);

  return Report;
};
