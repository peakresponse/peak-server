const fs = require('fs/promises');
const { StatusCodes } = require('http-status-codes');
const inflection = require('inflection');
const { JSONPath } = require('jsonpath-plus');
const _ = require('lodash');
const { DateTime } = require('luxon');
const xmlFormatter = require('xml-formatter');
const xmljs = require('xml-js');

const nemsisXsd = require('../lib/nemsis/xsd');
const nemsisSchematron = require('../lib/nemsis/schematron');
const { NemsisDemDataSetParser } = require('../lib/nemsis/demDataSetParser');
const rollbar = require('../lib/rollbar');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Version extends Base {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Version.belongsTo(models.NemsisStateDataSet, { as: 'stateDataSet' });
      Version.belongsTo(models.User, { as: 'createdBy' });
      Version.belongsTo(models.User, { as: 'updatedBy' });
      Version.belongsTo(models.Agency, { as: 'agency' });
    }

    toJSON() {
      const attributes = { ...this.get() };
      const payload = _.pick(attributes, [
        'id',
        'name',
        'agencyId',
        'isDraft',
        'nemsisVersion',
        'stateDataSetId',
        'demSchematronIds',
        'emsSchematronIds',
        'demCustomConfiguration',
        'isValid',
        'validationErrors',
        'createdAt',
        'createdById',
        'updatedAt',
        'updatedById',
      ]);
      if (this.stateDataSet) {
        payload.stateDataSet = this.stateDataSet.toJSON();
      }
      return payload;
    }

    async setStatus(code, message, options) {
      return this.update(
        {
          status: {
            ...this.status,
            code,
            message,
          },
        },
        { transaction: options?.transaction },
      );
    }

    async startImportDataSet(user, options) {
      if (!this.isDraft) {
        return;
      }
      await this.update({ isCancelled: false }, { transaction: options?.transaction });
      await this.setStatus(StatusCodes.ACCEPTED, 'Importing...', { transaction: options?.transaction });
      // perform in the background...
      const versionId = this.id;
      const createdByAgencyId = this.agencyId;
      const updatedById = user.id;
      // download attached file into tmp file, then set up parser
      let tmpFilePath;
      let parser;
      const customResults = [];
      const customConfigurations = [];
      this.downloadAssetFile('file')
        .then((filePath) => {
          tmpFilePath = filePath;
          parser = new NemsisDemDataSetParser(tmpFilePath);
        })
        .then(() =>
          parser.parseCustomConfigurations((data) =>
            sequelize.transaction(async (transaction) => {
              const [record, created] = await sequelize.models.CustomConfiguration.scope('finalOrNew').findOrCreate({
                where: {
                  createdByAgencyId,
                  customElementId: data._attributes?.CustomElementID,
                },
                defaults: {
                  versionId,
                  isDraft: true,
                  createdById: updatedById,
                  updatedById,
                  data,
                },
                include: ['draft'],
                transaction,
              });
              if (!created) {
                const draft = await record.updateDraft({ versionId, data, updatedById }, { transaction });
                customConfigurations.push(draft);
                return draft;
              }
              customConfigurations.push(record);
              return record;
            }),
          ),
        )
        .then(() =>
          parser.parseCustomResults((data) => {
            // check if this is mapped to an existing NEMSIS element
            const customElementId = data['dCustomResults.02']._text;
            const correlationId = data['dCustomResults.03']?._text;
            let nemsisElement;
            for (const customConfiguration of customConfigurations) {
              if (customConfiguration.customElementId === customElementId) {
                ({ nemsisElement } = customConfiguration);
                break;
              }
            }
            if (nemsisElement) {
              customResults.push({ nemsisElement, correlationId, data });
            } else {
              // TODO: store in db
            }
          }),
        )
        .then(() =>
          parser.parseAgency(async (data) => {
            const agency = await this.getAgency();
            return agency.updateDraft({ versionId, data, updatedById });
          }, customResults),
        )
        .then(() =>
          parser.parseConfigurations(
            (data) =>
              sequelize.transaction(async (transaction) => {
                const [record, created] = await sequelize.models.Configuration.scope('finalOrNew').findOrCreate({
                  where: {
                    createdByAgencyId,
                    stateId: data['dConfiguration.01']._text,
                  },
                  defaults: {
                    versionId,
                    isDraft: true,
                    createdById: updatedById,
                    updatedById,
                    data,
                  },
                  include: ['draft'],
                  transaction,
                });
                return created ? Promise.resolve(record) : record.updateDraft({ versionId, data, updatedById }, { transaction });
              }),
            customResults,
          ),
        )
        .then(() => parser.parseContacts((data) => sequelize.models.Contact.createOrUpdateDraft(this, user, data), customResults))
        .then(() => parser.parseDevices((data) => sequelize.models.Device.createOrUpdateDraft(this, user, data), customResults))
        .then(() =>
          parser.parseFacilities((data, other) => {
            const newData = {
              'dFacility.FacilityGroup': data,
            };
            if (other['dFacility.01']) {
              newData['dFacility.01'] = other['dFacility.01'];
            }
            return sequelize.models.Facility.createOrUpdateDraft(this, user, newData, data?._attributes?.UUID);
          }, customResults),
        )
        .then(() => parser.parseLocations((data) => sequelize.models.Location.createOrUpdateDraft(this, user, data), customResults))
        .then(() =>
          parser.parsePersonnel((data) => sequelize.models.Employment.createOrUpdateDraft(this, user, data, null, true), customResults),
        )
        .then(() => parser.parseVehicles((data) => sequelize.models.Vehicle.createOrUpdateDraft(this, user, data), customResults))
        .then(async () => {
          await this.setStatus(StatusCodes.OK);
        })
        .catch(async (err) => {
          // console.log(err);
          rollbar.error(err, { versionId });
          await this.setStatus(StatusCodes.INTERNAL_SERVER_ERROR, err.message);
        })
        .finally(async () => {
          if (tmpFilePath) {
            await fs.unlink(tmpFilePath);
          }
        });
    }

    async updateDEMCustomConfiguration(options) {
      if (!this.isDraft) {
        return Promise.resolve();
      }
      if (!options?.transaction) {
        return sequelize.transaction((transaction) => this.updateDEMCustomConfiguration({ ...options, transaction }));
      }
      const { transaction } = options;
      // get all final/draft (but not archived)/new DEMDataSet Custom Configurations
      let records = await sequelize.models.CustomConfiguration.scope('finalOrNew').findAll({
        include: ['draft'],
        where: {
          dataSet: 'DEMDataSet',
          createdByAgencyId: this.agencyId,
        },
        order: [['customElementId', 'ASC']],
        transaction,
      });
      records = await Promise.all(
        records
          .map((r) => {
            if (r.draft) {
              return r.draft.archivedAt ? null : r.draft.getData(this);
            }
            return r.getData(this);
          })
          .filter(Boolean),
      );
      return this.update({ demCustomConfiguration: records }, { transaction });
    }

    async regenerate(options) {
      if (!this.isDraft) {
        return Promise.resolve();
      }
      if (!options?.transaction) {
        return sequelize.transaction((transaction) => this.regenerate({ ...options, transaction }));
      }
      const { transaction } = options;
      const doc = {
        DEMDataSet: {
          _attributes: {
            xmlns: 'http://www.nemsis.org',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            'xsi:schemaLocation': `http://www.nemsis.org https://nemsis.org/media/nemsis_v3/${this.nemsisVersion}/XSDs/NEMSIS_XSDs/DEMDataSet_v3.xsd`,
          },
        },
      };
      if (this.demCustomConfiguration?.length > 0) {
        doc.DEMDataSet.dCustomConfiguration = {
          'dCustomConfiguration.CustomGroup': this.demCustomConfiguration,
        };
      }
      const agency = await this.getAgency({ include: 'draft', transaction });
      doc.DEMDataSet.DemographicReport = {
        _attributes: {
          timeStamp: DateTime.now().toISO(),
        },
        dAgency: await (agency.draft ?? agency).getData(this),
      };
      const dCustomResults = {
        'dCustomResults.ResultsGroup': [],
      };
      for (const modelName of ['Contact', 'Configuration', 'Location', 'Vehicle', 'Employment', 'Device', 'Facility']) {
        const queryOptions = {
          include: 'draft',
          where: { createdByAgencyId: agency.id },
          order: [['id', 'ASC']],
          transaction,
        };
        if (modelName === 'Facility') {
          queryOptions.order = [
            ['type', 'ASC'],
            ['id', 'ASC'],
          ];
        }
        // eslint-disable-next-line no-await-in-loop
        let records = await sequelize.models[modelName].scope('finalOrNew').findAll(queryOptions);
        // eslint-disable-next-line no-await-in-loop
        records = await Promise.all(
          records
            .map((r) => {
              if (r.draft) {
                if (r.draft.data.CustomResults) {
                  dCustomResults['dCustomResults.ResultsGroup'] = dCustomResults['dCustomResults.ResultsGroup'].concat(
                    r.draft.data.CustomResults,
                  );
                }
                return r.draft.archivedAt ? null : r.draft.getData(this);
              }
              if (r.data.CustomResults) {
                dCustomResults['dCustomResults.ResultsGroup'] = dCustomResults['dCustomResults.ResultsGroup'].concat(r.data.CustomResults);
              }
              return r.getData(this);
            })
            .filter(Boolean),
        );
        if (modelName === 'Facility') {
          const newRecords = [];
          let prevRecord;
          // process dFacility records into type groups
          for (const record of records) {
            if (prevRecord?._attributes.UUID === record._attributes.UUID) {
              if (!Array.isArray(prevRecord['dFacility.FacilityGroup'])) {
                prevRecord['dFacility.FacilityGroup'] = [prevRecord['dFacility.FacilityGroup']];
              }
              prevRecord['dFacility.FacilityGroup'] = prevRecord['dFacility.FacilityGroup'].concat(record['dFacility.FacilityGroup']);
            } else {
              newRecords.push(record);
              prevRecord = record;
            }
          }
          records = newRecords;
        }
        if (records.length) {
          const path = [sequelize.models[modelName].rootTag];
          if (sequelize.models[modelName].groupTag) {
            path.push(sequelize.models[modelName].groupTag);
          }
          _.set(doc.DEMDataSet.DemographicReport, path, records);
        }
      }
      if (dCustomResults['dCustomResults.ResultsGroup'].length > 0) {
        _.set(doc.DEMDataSet.DemographicReport, 'dCustomResults', dCustomResults);
      }
      const demDataSet = xmlFormatter(xmljs.js2xml(doc, { compact: true }), {
        collapseContent: true,
        lineSeparator: '\n',
        indentation: '\t',
      });
      return this.update({ demDataSet }, { transaction });
    }

    async nemsisValidate(options) {
      // get the js equivalent to the XML
      const doc = xmljs.xml2js(this.demDataSet, { compact: true });
      // run the DEM Data Set through XSD validation
      let validationErrors = await nemsisXsd.validateDemDataSet(this.nemsisVersion, this.demDataSet, doc);
      // run the DEM Data Set through national Schematron validation
      let schematronErrors = await nemsisSchematron.validateDemDataSet(this.nemsisVersion, this.demDataSet, doc);
      // run the DEM Data Set through state/additional Schematron validation
      if (this.demSchematronIds?.length) {
        const schematrons = await sequelize.models.NemsisSchematron.findAll({ where: { id: this.demSchematronIds } });
        for (const schematron of schematrons) {
          // eslint-disable-next-line no-await-in-loop
          const addlSchematronErrors = await schematron.nemsisValidate(this.demDataSet, doc);
          if (addlSchematronErrors) {
            if (schematronErrors) {
              schematronErrors.$json.errors = schematronErrors.$json.errors.concat(addlSchematronErrors.$json.errors);
            } else {
              schematronErrors = addlSchematronErrors;
            }
          }
        }
      }
      // function to extract model/section/id from error path
      function extract(error) {
        const { path } = error;
        const parts = [...path.matchAll(/\$|\['?([^'\]]+)'?\]/g)];
        let section;
        let model;
        let id;
        if (parts.length > 3) {
          // infer the model from top level element
          section = parts[3][1].substring(1);
          model = section;
          if (model === 'Personnel') {
            section = 'personnel';
            model = 'Employment';
          } else if (model === 'Agency') {
            section = 'agency';
            model = 'Agency';
          } else {
            section = inflection.pluralize(section.toLowerCase());
          }
          // extract the id (except for Agency which is a singleton)
          if (model !== 'Agency') {
            let subpath;
            let nextIndex;
            if (model === 'Facility' && parts.length > 6) {
              subpath = `$${parts[1][0]}${parts[2][0]}${parts[3][0]}${parts[4][0]}${parts[5][0]}${parts[6][0]}`;
              nextIndex = 7;
            } else if (parts.length > 4) {
              subpath = `$${parts[1][0]}${parts[2][0]}${parts[3][0]}${parts[4][0]}`;
              nextIndex = 5;
            }
            if (subpath) {
              let result = JSONPath({ wrap: false, path: subpath, json: doc });
              if (!result?._attributes?.UUID && parts.length > nextIndex) {
                subpath = `${subpath}${parts[nextIndex][0]}`;
                result = JSONPath({ wrap: false, path: subpath, json: doc });
              }
              id = result?._attributes?.UUID;
            }
          }
        }
        return { section, model, id };
      }
      // function to process errors/update models
      async function processErrors(opts) {
        if (!opts?.transaction) {
          return sequelize.transaction((transaction) => processErrors({ ...opts, transaction }));
        }
        const { transaction } = opts;
        // for each error, idenfity the model and id for the record it comes from
        if (validationErrors) {
          for (const error of validationErrors.$json.errors) {
            const { section, model, id } = extract(error);
            error.section = section;
            error.model = model;
            error.id = id;
          }
        }
        // for schematron errors, also set on the model object with appropriate path so it will be displayed on edit
        if (schematronErrors) {
          for (const error of schematronErrors.$json.errors) {
            const { section, model, id } = extract(error);
            error.section = section;
            error.model = model;
            error.id = id;
            // eslint-disable-next-line no-await-in-loop
            const obj = await sequelize.models[model].findOne({ where: { id }, transaction });
            if (obj) {
              obj.validationErrors = obj.validationErrors ?? { errors: [] };
              obj.validationErrors.errors = obj.validationErrors.errors ?? [];
              const objError = { ...error };
              const { rootTag, groupTag } = sequelize.models[model];
              if (groupTag) {
                objError.path = `$${objError.path.substring(objError.path.indexOf(`['${groupTag}']`))}`;
              } else if (rootTag) {
                objError.path = `$${objError.path.substring(objError.path.indexOf(`['${rootTag}']`) + rootTag.length + 4)}`;
              }
              obj.validationErrors.errors.push(objError);
              // eslint-disable-next-line no-await-in-loop
              await obj.update({ isValid: false, validationErrors: obj.validationErrors }, { transaction, hooks: false });
            }
          }
          if (validationErrors) {
            validationErrors.$json.errors = validationErrors.$json.errors.concat(schematronErrors.$json.errors);
          } else {
            validationErrors = schematronErrors;
          }
        }
        return validationErrors;
      }
      validationErrors = await processErrors(options);
      return this.update({ isValid: !validationErrors, validationErrors: validationErrors?.$json ?? null }, options ?? {});
    }

    async commit(options) {
      if (!options?.transaction) {
        return sequelize.transaction((transaction) => this.commit({ ...options, transaction }));
      }
      const { transaction } = options;
      // make sure the saved data set and validation errors are current
      await this.regenerate({ transaction });
      await this.nemsisValidate({ transaction });
      // iterate through all the demographics records and commit all drafts
      const agency = await this.getAgency({ include: 'draft', transaction });
      await agency.commitDraft({ transaction });
      for (const modelName of ['Contact', 'Configuration', 'Location', 'Vehicle', 'Employment', 'Device', 'Facility']) {
        const queryOptions = {
          include: 'draft',
          where: { createdByAgencyId: agency.id },
          order: [['id', 'ASC']],
          transaction,
        };
        // eslint-disable-next-line no-await-in-loop
        const records = await sequelize.models[modelName].scope('finalOrNew').findAll(queryOptions);
        // eslint-disable-next-line no-await-in-loop
        await Promise.all(records.map((r) => r.commitDraft({ transaction })));
      }
      // flip the isDraft flag on this record
      await this.update({ isDraft: false }, { transaction });
      // set this as the current Version on the Agency record
      return agency.update({ versionId: this.id }, { transaction });
    }
  }

  Version.init(
    {
      isDraft: {
        type: DataTypes.BOOLEAN,
      },
      name: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ['id', 'createdAt']),
        get() {
          return `${DateTime.fromJSDate(this.createdAt).toFormat('yyyy-MM-dd')}-${this.id?.replace(/-/g, '')}`;
        },
      },
      nemsisVersion: {
        type: DataTypes.STRING,
      },
      baseNemsisVersion: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ['nemsisVersion']),
        get() {
          const m = this.nemsisVersion.match(/^(\d+\.\d+\.\d+)/);
          return m?.length > 1 ? m[1] : null;
        },
      },
      demSchematronIds: {
        type: DataTypes.JSONB,
      },
      emsSchematronIds: {
        type: DataTypes.JSONB,
      },
      demCustomConfiguration: {
        type: DataTypes.JSONB,
      },
      emsCustomConfiguration: {
        type: DataTypes.JSONB,
      },
      demDataSet: {
        type: DataTypes.TEXT,
      },
      isValid: {
        type: DataTypes.BOOLEAN,
      },
      validationErrors: {
        type: DataTypes.JSONB,
      },
      file: {
        type: DataTypes.STRING,
      },
      fileName: {
        type: DataTypes.STRING,
      },
      fileUrl: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ['file']),
        get() {
          return this.assetUrl('file');
        },
      },
      status: {
        type: DataTypes.JSONB,
      },
      isCancelled: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      sequelize,
      modelName: 'Version',
      tableName: 'versions',
      underscored: true,
    },
  );

  Version.afterSave(async (record, options) => {
    await record.handleAssetFile('file', options);
  });

  return Version;
};
