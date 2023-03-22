const _ = require('lodash');
const { DateTime } = require('luxon');
const { Model } = require('sequelize');
const xmlFormatter = require('xml-formatter');
const xmljs = require('xml-js');

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
      let records = await sequelize.models.Vehicle.scope('finalOrNew').findAll({
        include: 'draft',
        where: { createdByAgencyId: agency.id },
        transaction,
      });
      records = records.map((r) => (r.draft ? r.draft.getData(this) : r.getData(this)));
      const doc = {
        DEMDataSet: {
          _attributes: {
            xmlns: 'http://www.nemsis.org',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
            'xsi:schemaLocation': `http://www.nemsis.org https://nemsis.org/media/nemsis_v3/${this.nemsisVersion}/XSDs/NEMSIS_XSDs/DEMDataSet_v3.xsd`,
          },
          DemographicReport: {
            dAgency: (agency.draft ?? agency).getData(this),
            dVehicle: {
              'dVehicle.VehicleGroup': records,
            },
          },
        },
      };
      const demDataSet = xmlFormatter(xmljs.js2xml(doc, { compact: true }), {
        collapseContent: true,
        lineSeparator: '\n',
        indentation: '\t',
      });
      return this.update({ demDataSet }, { transaction });
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
