const _ = require('lodash');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class File extends Base {
    static get xsdPath() {
      return 'eOther_v3.xsd';
    }

    static get rootTag() {
      return 'eOther';
    }

    static get groupTag() {
      return 'eOther.FileGroup';
    }

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

    toJSON() {
      const attributes = { ...this.get() };
      return _.pick(attributes, [
        'id',
        'canonicalId',
        'currentId',
        'parentId',
        'secondParentId',
        'file',
        'fileUrl',
        'metadata',
        'data',
        'updatedAttributes',
        'updatedDataAttributes',
        'isValid',
        'validationErrors',
        'createdAt',
        'createdById',
        'createdByAgencyId',
        'updatedAt',
        'updatedById',
        'updatedByAgencyId',
      ]);
    }
  }
  File.init(
    {
      file: DataTypes.STRING,
      fileUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.assetUrl('file');
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
    },
    {
      sequelize,
      modelName: 'File',
      tableName: 'files',
      underscored: true,
    }
  );

  File.beforeValidate(async (record, options) => {
    record.syncFieldAndNemsisValue('file', ['eOther.22'], options);
  });

  File.afterSave(async (record, options) => {
    if (!record.canonicalId) {
      return;
    }
    await record.handleAssetFile('file', options);
  });

  return File;
};
