const { Base } = require('./base');

const nemsisStates = require('../lib/nemsis/states');

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

    parseConfiguration(callback) {
      let parser;
      if (this.version) {
        const repo = nemsisStates.getNemsisStateRepo(this.stateId, this.baseNemsisVersion);
        parser = repo.getDataSetParser(this.version);
      } else {
        // download attached file into tmp file, then set up parser
      }
      return parser.parseConfiguration(callback);
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
      file: {
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

  return NemsisStateDataSet;
};
