const fs = require('fs/promises');
const { DateTime } = require('luxon');
const sequelizePaginate = require('sequelize-paginate');
const shelljs = require('shelljs');

const { Base } = require('./base');
const { getNemsisStateRepo } = require('../lib/nemsis/states');
const { validate } = require('../lib/nemsis/schematron');

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

    async validate(xml) {
      let schPath;
      if (this.version) {
        // get from state repository
        const repo = getNemsisStateRepo(this.stateId, this.baseNemsisVersion);
        schPath = repo.getDEMSchematronPath(this.version);
      } else if (this.file) {
        // download file attachment
        schPath = await this.downloadAssetFile('file');
      }
      if (schPath) {
        const xslPath = `${schPath}.xsl`;
        try {
          await fs.access(xslPath);
        } catch {
          shelljs.exec(`bin/sch-to-xsl ${schPath}`);
        }
        return validate(xml, xslPath);
      }
      return null;
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
          const version = this.version ?? `${DateTime.fromJSDate(this.createdAt).toISODate()}-${this.id}`;
          const m = version.match(/^(\d\d\d\d-\d\d-\d\d)-([\da-f-]+)$/);
          if (m) {
            return `${m[1]} (${m[2].substring(0, 8)})`;
          }
          return version;
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
