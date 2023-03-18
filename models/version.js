const _ = require('lodash');
const { DateTime } = require('luxon');
const { Model } = require('sequelize');

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
        type: DataTypes.JSONB,
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
