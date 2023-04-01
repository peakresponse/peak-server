const _ = require('lodash');
const { DateTime } = require('luxon');
const { Model } = require('sequelize');
const xmlFormatter = require('xml-formatter');
const xmljs = require('xml-js');

const nemsisXsd = require('../lib/nemsis/xsd');

module.exports = (sequelize, DataTypes) => {
  class Version extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Version.belongsTo(models.User, { as: 'createdBy' });
      Version.belongsTo(models.User, { as: 'updatedBy' });
      Version.belongsTo(models.Agency, { as: 'agency' });
    }

    toJSON() {
      const attributes = { ...this.get() };
      return _.pick(attributes, [
        'id',
        'name',
        'agencyId',
        'isDraft',
        'nemsisVersion',
        'stateDataSetVersion',
        'stateSchematronVersion',
        'isValid',
        'validationErrors',
        'createdAt',
        'createdById',
        'updatedAt',
        'updatedById',
      ]);
    }

    async regenerate(options) {
      if (!this.isDraft) {
        return Promise.resolve();
      }
      if (!options?.transaction) {
        return sequelize.transaction((transaction) => this.regenerate({ ...(options ?? {}), transaction }));
      }
      const { transaction } = options;
      const agency = await this.getAgency({ include: 'draft', transaction });
      const doc = {
        DEMDataSet: {
          _attributes: {
            xmlns: 'http://www.nemsis.org',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            'xsi:schemaLocation': `http://www.nemsis.org https://nemsis.org/media/nemsis_v3/${this.nemsisVersion}/XSDs/NEMSIS_XSDs/DEMDataSet_v3.xsd`,
          },
          DemographicReport: {
            dAgency: (agency.draft ?? agency).getData(this),
          },
        },
      };
      for (const modelName of ['Configuration', 'Vehicle']) {
        // eslint-disable-next-line no-await-in-loop
        let records = await sequelize.models[modelName].scope('finalOrNew').findAll({
          include: 'draft',
          where: { createdByAgencyId: agency.id },
          order: [['id', 'ASC']],
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
        const path = [sequelize.models[modelName].rootTag];
        if (sequelize.models[modelName].groupTag) {
          path.push(sequelize.models[modelName].groupTag);
        }
        _.set(doc.DEMDataSet.DemographicReport, path, records);
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
      return nemsisXsd.validateDemDataSet(this.nemsisVersion, this.demDataSet);
    }
  }
  Version.init(
    {
      isDraft: {
        type: DataTypes.BOOLEAN,
        field: 'is_draft',
      },
      name: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ['id', 'createdAt']),
        get() {
          return `${DateTime.fromJSDate(this.createdAt).toFormat('yyyy-MM-dd')}-${this.id?.replace(/-/g, '')}`;
        },
      },
      nemsisVersion: {
        type: DataTypes.STRING,
        field: 'nemsis_version',
      },
      baseNemsisVersion: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ['nemsisVersion']),
        get() {
          const m = this.nemsisVersion.match(/^(\d+\.\d+\.\d+)/);
          return m?.length > 1 ? m[1] : null;
        },
      },
      stateDataSetVersion: {
        type: DataTypes.STRING,
        field: 'state_data_set_version',
      },
      stateSchematronVersion: {
        type: DataTypes.STRING,
        field: 'state_schematron_version',
      },
      demCustomConfiguration: {
        type: DataTypes.JSONB,
        field: 'dem_custom_configuration',
      },
      emsCustomConfiguration: {
        type: DataTypes.JSONB,
        field: 'ems_custom_configuration',
      },
      demDataSet: {
        type: DataTypes.TEXT,
      },
      isValid: {
        type: DataTypes.BOOLEAN,
        field: 'is_valid',
      },
      validationErrors: {
        type: DataTypes.JSONB,
        field: 'validation_errors',
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
