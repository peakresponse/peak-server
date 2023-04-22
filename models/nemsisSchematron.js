const { DateTime } = require('luxon');
const sequelizePaginate = require('sequelize-paginate');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class NemsisSchematron extends Base {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      NemsisSchematron.belongsTo(models.State, { as: 'state' });
      NemsisSchematron.belongsTo(models.Agency, { as: 'createdByAgency' });
      NemsisSchematron.belongsTo(models.User, { as: 'createdBy' });
      NemsisSchematron.belongsTo(models.User, { as: 'updatedBy' });
    }
  }

  NemsisSchematron.init(
    {
      dataSet: {
        type: DataTypes.STRING,
      },
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
      fileUrl: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ['file']),
        get() {
          return this.assetUrl('file');
        },
      },
      fileName: {
        type: DataTypes.STRING,
      },
      fileVersion: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'NemsisSchematron',
      tableName: 'nemsis_schematrons',
      underscored: true,
    }
  );

  NemsisSchematron.afterSave(async (record, options) => {
    await record.handleAssetFile('file', options);
  });

  sequelizePaginate.paginate(NemsisSchematron);

  return NemsisSchematron;
};
