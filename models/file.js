const fs = require('fs/promises');
const _ = require('lodash');
const tmp = require('tmp-promise');

const { Base } = require('./base');
const utils = require('../lib/utils');

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

    async getData(version) {
      const data = await super.getData(version);
      if (this.file) {
        data['eOther.11'] = { _text: this.id.replace(/-/g, '') };
        data['eOther.22'] = { _text: this.file };
      }
      return data;
    }

    async insertFileInto(xmlFilePath) {
      if (!this.file) {
        return;
      }
      let filePath;
      let tmpFile;
      try {
        filePath = await this.downloadAssetFile('file');
        tmpFile = await tmp.file();
        await utils.base64Encode(filePath, tmpFile.path);
        await utils.insertFileIntoFile(tmpFile.path, xmlFilePath, `(<eOther\\.11>)(${this.id.replace(/-/g, '')})(<\\/eOther\\.11>)`);
      } finally {
        if (filePath) {
          await fs.unlink(filePath);
        }
        await tmpFile?.cleanup();
      }
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
    },
  );

  File.afterSave(async (record, options) => {
    if (!record.canonicalId) {
      return;
    }
    await record.handleAssetFile('file', options);
  });

  return File;
};
