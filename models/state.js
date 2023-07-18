/* eslint-disable no-await-in-loop */
const { Model } = require('sequelize');
const fs = require('fs');
const HttpStatus = require('http-status-codes');
const _ = require('lodash');
const path = require('path');

const nemsis = require('../lib/nemsis');
const CommonTypes = require('../lib/nemsis/commonTypes');
const nemsisStates = require('../lib/nemsis/states');

const stateCodes = {
  values: [],
  codeMapping: {},
  nameMapping: {},
  abbrMapping: {},
};
// state codes, downloaded from: https://www.census.gov/library/reference/code-lists/ansi/ansi-codes-for-states.html
// manually modified to include border states data from: https://thefactfile.org/u-s-states-and-their-border-states/
const psv = fs.readFileSync(path.resolve(__dirname, '../lib/states.txt')).toString();
const lines = psv.split('\n');
// remove header row
lines.shift();
for (const line of lines) {
  // parse each line
  const tokens = line.split('|');
  const value = {
    code: tokens[0],
    abbr: tokens[1],
    name: tokens[2],
    gnsid: tokens[3],
  };
  stateCodes.values.push(value);
  stateCodes.codeMapping[value.code] = value;
  stateCodes.nameMapping[value.name] = value;
  stateCodes.abbrMapping[value.abbr] = value;
}

module.exports = (sequelize, DataTypes) => {
  class State extends Model {
    static associate(models) {
      // associations can be defined here
      State.hasMany(models.Agency, { as: 'agencies', foreignKey: 'stateId' });
    }

    static getAbbrForCode(code) {
      return stateCodes.codeMapping[code]?.abbr;
    }

    static getCodeForAbbr(abbr) {
      return stateCodes.abbrMapping[abbr.toUpperCase()]?.code;
    }

    static getCodeForName(name) {
      return stateCodes.nameMapping[name]?.code;
    }

    static getNameForCode(code) {
      return stateCodes.codeMapping[code]?.name;
    }

    toJSON() {
      const attributes = { ...this.get() };
      // by default, don't return the large attributes
      delete attributes.dataSet;
      delete attributes.dataSetXml;
      delete attributes.schematronXml;
      return attributes;
    }

    async startConfiguration(user) {
      // synchronously set starting status state...
      await this.setConfigurationStatus(HttpStatus.ACCEPTED, 'Starting state configuration...');
      // configure in background...
      this.configure(user.id);
    }

    setConfigurationStatus(code, message) {
      return this.update({
        dataSet: {
          status: {
            code,
            message,
          },
        },
      });
    }

    async configure(userId) {
      let tmpDir;
      try {
        // populate cities for the state and bordering states
        const stateIds = [this.id, ...this.borderStates];
        for (const stateId of stateIds) {
          await this.setConfigurationStatus(HttpStatus.ACCEPTED, `Populating city database for ${State.getNameForCode(stateId)}...`);
          await sequelize.models.City.importCitiesForState(stateId);
        }
        // import PSAPs for the state
        await this.setConfigurationStatus(HttpStatus.ACCEPTED, `Populating PSAP database for ${this.name}...`);
        await sequelize.models.Psap.importPsapsForState(this.id);
        // fetch NEMSIS state repositories list and find state repository
        const repos = await nemsis.getStateRepos();
        const repo = _.find(repos.values, { name: this.name });
        if (!repo) {
          await this.setConfigurationStatus(HttpStatus.NOT_FOUND, 'NEMSIS state data repository not found.');
          return;
        }
        // download all the files in the state repository
        const files = await nemsis.getStateRepoFiles(repo.slug);
        tmpDir = await nemsis.downloadRepoFiles(repo.slug, files.values);
        await this.setConfigurationStatus(HttpStatus.ACCEPTED, 'Processing downloaded NEMSIS state data...');
        // find the NEMSIS state data set and schematron files
        let dataSet = null;
        let schematronXml = null;
        for (const filePath of files.values) {
          if (filePath.startsWith('Resources') && filePath.endsWith('StateDataSet.xml')) {
            dataSet = await nemsis.parseStateDataSet(path.resolve(tmpDir.name, filePath));
          } else if (filePath.startsWith('Schematron') && filePath.endsWith('EMSDataSet.sch.xml')) {
            schematronXml = fs.readFileSync(path.resolve(tmpDir.name, filePath));
          }
        }
        if (!dataSet) {
          await this.setConfigurationStatus(HttpStatus.NOT_FOUND, 'NEMSIS state data set not found.');
          return;
        }
        if (!schematronXml) {
          await this.setConfigurationStatus(HttpStatus.NOT_FOUND, 'NEMSIS state schematron not found.');
          return;
        }
        // special-case handling for states
        if (nemsisStates[repo.slug] && nemsisStates[repo.slug].processStateRepoFiles) {
          await nemsisStates[repo.slug].processStateRepoFiles(sequelize.models, tmpDir, files.values, dataSet);
        }
        // add associated Agencies from the state data set
        if (dataSet.json.StateDataSet.sAgency && dataSet.json.StateDataSet.sAgency.sAgencyGroup) {
          if (!Array.isArray(dataSet.json.StateDataSet.sAgency.sAgencyGroup)) {
            dataSet.json.StateDataSet.sAgency.sAgencyGroup = [dataSet.json.StateDataSet.sAgency.sAgencyGroup];
          }
          const { length } = dataSet.json.StateDataSet.sAgency.sAgencyGroup;
          for (let i = 0; i < length; i += 100) {
            await this.setConfigurationStatus(HttpStatus.ACCEPTED, `Populating state agencies... ${i}/${length}`);
            await sequelize.transaction(async (transaction) => {
              for (let j = i; j < Math.min(i + 100, length); j += 1) {
                const sAgency = dataSet.json.StateDataSet.sAgency.sAgencyGroup[j];
                const [agency] = await sequelize.models.Agency.findOrBuild({
                  where: {
                    stateUniqueId: sAgency['sAgency.01']._text,
                    number: sAgency['sAgency.02']._text,
                    stateId: this.id,
                  },
                  transaction,
                });
                agency.name = sAgency['sAgency.03']._text;
                agency.data = sAgency;
                agency.createdById = userId;
                agency.updatedById = userId;
                await agency.save({ transaction });
              }
            });
          }
          await this.setConfigurationStatus(HttpStatus.ACCEPTED, `Populating state agencies... ${length}/${length}`);
        }
        // add associated Facilities from state data set
        if (dataSet.json.StateDataSet.sFacility && dataSet.json.StateDataSet.sFacility.sFacilityGroup) {
          if (!Array.isArray(dataSet.json.StateDataSet.sFacility.sFacilityGroup)) {
            dataSet.json.StateDataSet.sFacility.sFacilityGroup = [dataSet.json.StateDataSet.sFacility.sFacilityGroup];
          }
          for (const sFacilityGroup of dataSet.json.StateDataSet.sFacility.sFacilityGroup) {
            const type = sFacilityGroup['sFacility.01']?._text;
            if (sFacilityGroup['sFacility.FacilityGroup']) {
              if (!Array.isArray(sFacilityGroup['sFacility.FacilityGroup'])) {
                sFacilityGroup['sFacility.FacilityGroup'] = [sFacilityGroup['sFacility.FacilityGroup']];
              }
              const { length } = sFacilityGroup['sFacility.FacilityGroup'];
              for (let i = 0; i < length; i += 10) {
                await this.setConfigurationStatus(
                  HttpStatus.ACCEPTED,
                  `Populating state ${type ? CommonTypes.enums.TypeOfFacility.valueMapping[type] : ''} facilities... ${i}/${length}`
                );
                await sequelize.transaction(async (transaction) => {
                  for (let j = i; j < Math.min(i + 10, length); j += 1) {
                    const sFacility = sFacilityGroup['sFacility.FacilityGroup'][j];
                    const [facility] = await sequelize.models.Facility.findOrBuild({
                      where: {
                        stateId: sFacility['sFacility.09']?._text || null,
                        locationCode: sFacility['sFacility.03']?._text || null,
                      },
                      transaction,
                    });
                    facility.data = {
                      'sFacility.FacilityGroup': sFacility,
                    };
                    if (type) {
                      facility.data['sFacility.01'] = { _text: type };
                    }
                    if (!sFacility['sFacility.13'] && process.env.NODE_ENV !== 'test') {
                      /// don't perform in test, so we don't exceed request quotas
                      await facility.geocode();
                    }
                    facility.createdById = userId;
                    facility.updatedById = userId;
                    await facility.save({ transaction });
                  }
                });
              }
              await this.setConfigurationStatus(
                HttpStatus.ACCEPTED,
                `Populating state ${type ? CommonTypes.enums.TypeOfFacility.valueMapping[type] : ''} facilities... ${length}/${length}`
              );
            }
          }
        }
        await this.update({
          isConfigured: true,
          dataSet: dataSet.json,
          dataSetXml: dataSet.xml,
          schematronXml,
        });
      } catch (error) {
        // console.log(error);
        await this.setConfigurationStatus(HttpStatus.INTERNAL_SERVER_ERROR, error.toString());
      } finally {
        tmpDir?.removeCallback();
      }
    }
  }

  State.init(
    {
      name: DataTypes.STRING,
      abbr: {
        type: DataTypes.VIRTUAL(DataTypes.STRING),
        get() {
          return State.getAbbrForCode(this.id);
        },
      },
      borderStates: {
        type: DataTypes.JSONB,
        field: 'border_states',
      },
      isConfigured: DataTypes.BOOLEAN,
      dataSet: {
        type: DataTypes.JSONB,
        field: 'data_set',
      },
      dataSetXml: {
        type: DataTypes.TEXT,
        field: 'data_set_xml',
      },
      schematronXml: {
        type: DataTypes.TEXT,
        field: 'schematron_xml',
      },
    },
    {
      sequelize,
      modelName: 'State',
      tableName: 'states',
      underscored: true,
      defaultScope: {
        attributes: {
          exclude: ['dataSet', 'dataSetXml', 'schematronXml'],
        },
      },
    }
  );

  return State;
};
