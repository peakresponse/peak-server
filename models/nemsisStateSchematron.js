const { DateTime } = require('luxon');
const sequelizePaginate = require('sequelize-paginate');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class NemsisStateSchematron extends Base {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      NemsisStateSchematron.belongsTo(models.State, { as: 'state' });
      NemsisStateSchematron.belongsTo(models.Agency, { as: 'createdByAgency' });
      NemsisStateSchematron.belongsTo(models.User, { as: 'createdBy' });
      NemsisStateSchematron.belongsTo(models.User, { as: 'updatedBy' });
    }
  }

  NemsisStateSchematron.init(
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
      modelName: 'NemsisStateSchematron',
      tableName: 'nemsis_state_schematrons',
      underscored: true,
    }
  );

  NemsisStateSchematron.afterSave(async (record, options) => {
    await record.handleAssetFile('file', options);
  });

  sequelizePaginate.paginate(NemsisStateSchematron);

  return NemsisStateSchematron;
};
