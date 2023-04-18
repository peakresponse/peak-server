const { DateTime } = require('luxon');
const HttpStatus = require('http-status-codes');
const { Op } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');

const nemsisStates = require('../lib/nemsis/states');
const { NemsisStateDataSetParser } = require('../lib/nemsis/stateDataSetParser');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class NemsisStateDataSet extends Base {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      NemsisStateDataSet.belongsTo(models.State, { as: 'state' });
      NemsisStateDataSet.belongsTo(models.Agency, { as: 'createdByAgency' });
      NemsisStateDataSet.belongsTo(models.User, { as: 'createdBy' });
      NemsisStateDataSet.belongsTo(models.User, { as: 'updatedBy' });
    }

    async getParser() {
      let parser;
      if (this.version) {
        const repo = nemsisStates.getNemsisStateRepo(this.stateId, this.baseNemsisVersion);
        parser = repo.getDataSetParser(this.version);
      } else {
        // download attached file into tmp file, then set up parser
        const tmpFilePath = await this.downloadAssetFile('file');
        parser = new NemsisStateDataSetParser(null, tmpFilePath);
      }
      return parser;
    }

    async parseAgencies(callback) {
      const parser = await this.getParser();
      return parser.parseAgencies(callback);
    }

    async parseConfiguration(callback) {
      const parser = await this.getParser();
      return parser.parseConfiguration(callback);
    }

    async parseFacilities(callback) {
      const parser = await this.getParser();
      return parser.parseFacilities(callback);
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

    async importAgencies(userId) {
      let total = 0;
      await this.parseAgencies(() => {
        total += 1;
      });
      let count = 0;
      await this.parseAgencies(async (dataSetNemsisVersion, stateId, agency) => {
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
          record.stateDataSetId = this.id;
          record.nemsisVersion = dataSetNemsisVersion;
          record.createdById = record.createdById || userId;
          record.updatedById = userId;
          await record.save({ transaction });
        });
      });
      await this.setStatus(HttpStatus.ACCEPTED, `Imported ${count} Agencies`);
    }

    async importFacilities(userId) {
      let total = 0;
      await this.parseFacilities(() => {
        total += 1;
      });
      let count = 0;
      await this.parseFacilities(async (dataSetNemsisVersion, stateId, facilityType, facility) => {
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
                stateId: facility['sFacility.09']?._text || stateId,
                locationCode: facility['sFacility.03']?._text || null,
              },
              transaction,
            });
          } else {
            [record] = await sequelize.models.Facility.findOrBuild({
              where: {
                stateId: facility['sFacility.09']?._text || stateId,
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

  NemsisStateDataSet.init(
    {
      nemsisVersion: {
        type: DataTypes.STRING,
      },
      baseNemsisVersion: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ['nemsisVersion']),
        get() {
          const m = this.nemsisVersion.match(/^(\d+\.\d+\.\d+)/);
          return m[1];
        },
      },
      version: {
        type: DataTypes.STRING,
      },
      displayVersion: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ['version', 'createdAt']),
        get() {
          if (this.version) {
            return this.version;
          }
          return `${DateTime.fromJSDate(this.createdAt).toISODate()}-${this.id}`;
        },
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
    },
    {
      sequelize,
      modelName: 'NemsisStateDataSet',
      tableName: 'nemsis_state_data_sets',
      underscored: true,
    }
  );

  NemsisStateDataSet.afterSave(async (record, options) => {
    await record.handleAssetFile('file', options);
  });

  sequelizePaginate.paginate(NemsisStateDataSet);

  return NemsisStateDataSet;
};
