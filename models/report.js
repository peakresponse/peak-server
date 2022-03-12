const inflection = require('inflection');

const { Base } = require('./base');
const nemsis = require('../lib/nemsis');

module.exports = (sequelize, DataTypes) => {
  class Report extends Base {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Report.belongsTo(Report, { as: 'canonical' });
      Report.belongsTo(Report, { as: 'current' });
      Report.belongsTo(Report, { as: 'parent' });
      Report.belongsTo(Report, { as: 'secondParent' });
      Report.belongsTo(models.User, { as: 'createdBy' });
      Report.belongsTo(models.User, { as: 'updatedBy' });
      Report.belongsTo(models.Agency, { as: 'createdByAgency' });
      Report.belongsTo(models.Agency, { as: 'updatedByAgency' });

      Report.belongsTo(models.Incident, { as: 'incident' });
      Report.belongsTo(models.Response, { as: 'response' });
      Report.belongsTo(models.Scene, { as: 'scene' });
      Report.belongsTo(models.Time, { as: 'time' });
      Report.belongsTo(models.Patient, { as: 'patient' });
      Report.belongsTo(models.Situation, { as: 'situation' });
      Report.belongsTo(models.History, { as: 'history' });
      Report.belongsTo(models.Disposition, { as: 'disposition' });
      Report.belongsTo(models.Narrative, { as: 'narrative' });
      Report.belongsToMany(models.Medication, { as: 'medications', through: 'reports_medications', timestamps: false });
      Report.belongsToMany(models.Procedure, { as: 'procedures', through: 'reports_procedures', timestamps: false });
      Report.belongsToMany(models.Vital, { as: 'vitals', through: 'reports_vitals', timestamps: false });
      Report.belongsToMany(models.File, { as: 'files', through: 'reports_files', timestamps: false });

      Report.hasMany(Report, { as: 'versions', foreignKey: 'canonicalId' });
    }

    static async createOrUpdate(user, agency, data, options) {
      if (!options?.transaction) {
        return sequelize.transaction((transaction) => Report.createOrUpdate(user, agency, data, { ...options, transaction }));
      }
      const [record, created] = await Base.createOrUpdate(
        Report,
        user,
        agency,
        data,
        ['incidentId'],
        [
          'data',
          'responseId',
          'sceneId',
          'timeId',
          'patientId',
          'situationId',
          'historyId',
          'medicationIds',
          'vitalIds',
          'procedureIds',
          'dispositionId',
          'narrativeId',
          'fileIds',
          'ringdownId',
          'predictions',
        ],
        options
      );
      for (const prefix of ['medication', 'procedure', 'vital', 'file']) {
        const ids = data[`${prefix}Ids`];
        if (ids) {
          // eslint-disable-next-line no-await-in-loop
          await record[`set${inflection.capitalize(prefix)}s`](ids, { transaction: options.transaction });
        }
      }
      return [record, created];
    }
  }

  Report.init(
    {
      data: DataTypes.JSONB,
      updatedAttributes: {
        type: DataTypes.JSONB,
        field: 'updated_attributes',
      },
      updatedDataAttributes: {
        type: DataTypes.JSONB,
        field: 'updated_data_attributes',
      },
      isValid: {
        type: DataTypes.BOOLEAN,
        field: 'is_valid',
      },
      validationErrors: {
        type: DataTypes.JSONB,
        field: 'validation_errors',
      },
      medicationIds: {
        type: DataTypes.JSONB,
        field: 'medication_ids',
      },
      procedureIds: {
        type: DataTypes.JSONB,
        field: 'procedure_ids',
      },
      vitalIds: {
        type: DataTypes.JSONB,
        field: 'vital_ids',
      },
      fileIds: {
        type: DataTypes.JSONB,
        field: 'file_ids',
      },
      ringdownId: {
        type: DataTypes.STRING,
        field: 'ringdown_id',
      },
      predictions: {
        type: DataTypes.JSONB,
      },
    },
    {
      sequelize,
      modelName: 'Report',
      tableName: 'reports',
      underscored: true,
      validate: {
        id() {
          if (!this.canonicalId && !this.parentId) {
            // make sure this canonical record has its id set as the record id
            if (this.id !== this.getFirstNemsisValue(['eRecord.01'])) {
              throw new Error();
            }
          }
        },
        async schema() {
          this.validationErrors = await nemsis.validateSchema('eRecord_v3.xsd', 'eRecord', null, this.data);
          this.isValid = this.validationErrors === null;
        },
      },
    }
  );

  Report.addScope('canonical', {
    where: {
      canonicalId: null,
      parentId: null,
    },
  });

  return Report;
};
