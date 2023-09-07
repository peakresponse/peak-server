const _ = require('lodash');
const { DateTime } = require('luxon');
const { Model } = require('sequelize');
const xmlFormatter = require('xml-formatter');
const xmljs = require('xml-js');

const nemsisXsd = require('../lib/nemsis/xsd');
const nemsisSchematron = require('../lib/nemsis/schematron');

module.exports = (sequelize, DataTypes) => {
  class Version extends Model {
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

    async updateDEMCustomConfiguration(options) {
      if (!this.isDraft) {
        return Promise.resolve();
      }
      if (!options?.transaction) {
        return sequelize.transaction((transaction) => this.regenerate({ ...options, transaction }));
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
      records = records
        .map((r) => {
          if (r.draft) {
            return r.draft.archivedAt ? null : r.draft.getData(this);
          }
          return r.getData(this);
        })
        .filter(Boolean);
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
        dAgency: (agency.draft ?? agency).getData(this),
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
        records = records
          .map((r) => {
            if (r.draft) {
              if (r.draft.data.CustomResults) {
                dCustomResults['dCustomResults.ResultsGroup'] = dCustomResults['dCustomResults.ResultsGroup'].concat(
                  r.draft.data.CustomResults['dCustomResults.ResultsGroup']
                );
              }
              return r.draft.archivedAt ? null : r.draft.getData(this);
            }
            if (r.data.CustomResults) {
              dCustomResults['dCustomResults.ResultsGroup'] = dCustomResults['dCustomResults.ResultsGroup'].concat(
                r.data.CustomResults['dCustomResults.ResultsGroup']
              );
            }
            return r.getData(this);
          })
          .filter(Boolean);
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

    async nemsisValidate() {
      // run the DEM Data Set through XSD validation
      let validationErrors = await nemsisXsd.validateDemDataSet(this.nemsisVersion, this.demDataSet);
      // run the DEM Data Set through national Schematron validation
      if (!validationErrors) {
        validationErrors = await nemsisSchematron.validateDemDataSet(this.nemsisVersion, this.demDataSet);
      }
      // run the DEM Data Set through state/additional Schematron validation
      if (!validationErrors && this.demSchematronIds?.length) {
        const schematrons = await sequelize.models.NemsisSchematron.findAll({ where: { id: this.demSchematronIds } });
        for (const schematron of schematrons) {
          // eslint-disable-next-line no-await-in-loop
          validationErrors = await schematron.validate(this.demDataSet);
          if (validationErrors) {
            break;
          }
        }
      }
      // run the DEM Data Set through any additonal configured Schematron validation
      return this.update({ isValid: !validationErrors, validationErrors });
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
    },
    {
      sequelize,
      modelName: 'Version',
      tableName: 'versions',
      underscored: true,
    }
  );
  return Version;
};
