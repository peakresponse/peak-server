const { Model, Op } = require('sequelize');
const HttpStatus = require('http-status-codes');

const States = require('../lib/states');

module.exports = (sequelize, DataTypes) => {
  class State extends Model {
    static associate(models) {
      // associations can be defined here
      State.hasMany(models.Agency, { as: 'agencies', foreignKey: 'stateId' });
    }

    static getAbbrForCode(code) {
      return States.codeMapping[code]?.abbr;
    }

    static getCodeForAbbr(abbr) {
      return States.abbrMapping[abbr.toUpperCase()]?.code;
    }

    static getCodeForName(name) {
      return States.nameMapping[name]?.code;
    }

    static getNameForCode(code) {
      return States.codeMapping[code]?.name;
    }

    toJSON() {
      const attributes = { ...this.get() };
      // by default, don't return the large attributes
      delete attributes.dataSet;
      delete attributes.dataSetXml;
      delete attributes.schematronXml;
      return attributes;
    }

    setStatus(code, message, options) {
      return this.update(
        {
          status: {
            ...this.status,
            code,
            message,
          },
        },
        { transaction: options?.transaction }
      );
    }

    async startImportDataSet(user, stateDataSet) {
      await this.setStatus(HttpStatus.ACCEPTED, 'Importing Agencies...');
      // perform the following in the background
      this.importAgencies(user.id, stateDataSet)
        .then(() => this.reload())
        .then(() => {
          if (this.status?.isCancelled) {
            return Promise.resolve();
          }
          return this.importFacilities(user.id, stateDataSet);
        })
        .then(() => this.reload())
        .then(() => {
          if (this.status?.isCancelled) {
            return this.setStatus(HttpStatus.OK, 'Import cancelled');
          }
          return this.setStatus(HttpStatus.OK, 'Import completed');
        });
    }

    cancelImportDataSet(options) {
      let status;
      if (this.status?.isCancelled || this.status?.code === HttpStatus.OK) {
        status = {};
      } else {
        status = {
          code: HttpStatus.OK,
          message: 'Import cancelled',
          isCancelled: true,
        };
      }
      return this.update({ status }, { transaction: options?.transaction });
    }

    async importAgencies(userId, stateDataSet) {
      let total = 0;
      await stateDataSet.parseAgencies(() => {
        total += 1;
      });
      let count = 0;
      await stateDataSet.parseAgencies(async (dataSetNemsisVersion, stateId, agency) => {
        await this.reload();
        if (this.status?.isCancelled) {
          return;
        }
        count += 1;
        await sequelize.transaction(async (transaction) => {
          await this.setStatus(HttpStatus.ACCEPTED, `Importing ${count}/${total} Agencies...`, { transaction });
          const [record] = await sequelize.models.Agency.scope('canonical').findOrBuild({
            where: {
              stateUniqueId: agency['sAgency.01']._text,
              number: agency['sAgency.02']._text,
              stateId,
            },
            transaction,
          });
          record.name = agency['sAgency.03']._text;
          record.data = agency;
          record.stateDataSetId = stateDataSet.id;
          record.nemsisVersion = dataSetNemsisVersion;
          record.createdById = record.createdById || userId;
          record.updatedById = userId;
          await record.save({ transaction });
        });
      });
      await this.setStatus(HttpStatus.ACCEPTED, `Imported ${count} Agencies`);
    }

    async importFacilities(userId, stateDataSet) {
      let total = 0;
      await stateDataSet.parseFacilities(() => {
        total += 1;
      });
      let count = 0;
      await stateDataSet.parseFacilities(async (dataSetNemsisVersion, facilityType, facility) => {
        await this.reload();
        if (this.status?.isCancelled) {
          return;
        }
        count += 1;
        await sequelize.transaction(async (transaction) => {
          await this.setStatus(HttpStatus.ACCEPTED, `Importing ${count}/${total} Facilities...`, { transaction });
          let record;
          if (facility['sFacility.03']?._text) {
            [record] = await sequelize.models.Facility.findOrBuild({
              where: {
                stateId: facility['sFacility.09']?._text || this.id,
                locationCode: facility['sFacility.03']?._text || null,
              },
              transaction,
            });
          } else {
            [record] = await sequelize.models.Facility.findOrBuild({
              where: {
                stateId: facility['sFacility.09']?._text || this.id,
                name: {
                  [Op.iLike]: facility['sFacility.02']?._text || null,
                },
              },
              defaults: {
                name: facility['sFacility.02']?._text || null,
              },
              transaction,
            });
          }
          record.data = {
            'sFacility.FacilityGroup': facility,
          };
          if (facilityType) {
            record.data['sFacility.01'] = { _text: facilityType };
          }
          if (!facility['sFacility.13'] && process.env.NODE_ENV !== 'test') {
            /// don't perform in test, so we don't exceed request quotas
            await record.geocode();
          }
          record.createdById = record.createdById || userId;
          record.updatedById = userId;
          await record.save({ transaction });
        });
      });
      await this.setStatus(HttpStatus.ACCEPTED, `Imported ${count} Facilities`);
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
      status: {
        type: DataTypes.JSONB,
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
