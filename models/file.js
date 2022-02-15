const { Base } = require('./base');
const nemsis = require('../lib/nemsis');

module.exports = (sequelize, DataTypes) => {
  class File extends Base {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      File.belongsTo(File, { as: 'canonical' });
      File.belongsTo(File, { as: 'current' });
      File.belongsTo(File, { as: 'parent' });
      File.belongsTo(File, { as: 'secondParent' });
      File.belongsTo(models.User, { as: 'createdBy' });
      File.belongsTo(models.User, { as: 'updatedBy' });
      File.belongsTo(models.Agency, { as: 'createdByAgency' });
      File.belongsTo(models.Agency, { as: 'updatedByAgency' });
    }

    static createOrUpdate(user, agency, data, options) {
      return Base.createOrUpdate(File, user, agency, data, [], ['file', 'metadata', 'data'], options);
    }
  };
  File.init({
    file: DataTypes.STRING,
    fileUrl: {
      type: DataTypes.VIRTUAL,
      get() {
        return Base.assetUrl('files/file', this.file);
      },
    },
    metadata: DataTypes.JSONB,
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
  }, {
    sequelize,
    modelName: 'File',
    tableName: 'files',
    underscored: true,
    validate: {
      async schema() {
        this.validationErrors = await nemsis.validateSchema(
          'eOther_v3.xsd',
          'eOther',
          'eOther.FileGroup',
          this.data
        );
        this.isValid = this.validationErrors === null;
      },
    },
  });

  File.afterSave(async (file, options) => {
    if (file.canonicalId) {
      return;
    }
    if (file.changed('file')) {
      await Base.handleAssetFile('files/file', file.previous('file'), file.file, options);
    }
  });

  return File;
};
