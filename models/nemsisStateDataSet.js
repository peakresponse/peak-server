const { DateTime } = require('luxon');
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
