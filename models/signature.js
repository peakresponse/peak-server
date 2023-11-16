const _ = require('lodash');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Signature extends Base {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Signature.belongsTo(Signature, { as: 'canonical' });
      Signature.belongsTo(Signature, { as: 'current' });
      Signature.belongsTo(Signature, { as: 'parent' });
      Signature.belongsTo(Signature, { as: 'secondParent' });
      Signature.belongsTo(models.Form, { as: 'form' });
      Signature.belongsTo(models.User, { as: 'createdBy' });
      Signature.belongsTo(models.User, { as: 'updatedBy' });
      Signature.belongsTo(models.Agency, { as: 'createdByAgency' });
      Signature.belongsTo(models.Agency, { as: 'updatedByAgency' });
    }

    static createOrUpdate(user, agency, data, options) {
      return Base.createOrUpdate(Signature, user, agency, data, ['formId', 'formInstanceId'], ['file', 'data'], options);
    }

    toJSON() {
      const attributes = { ...this.get() };
      return _.pick(attributes, [
        'id',
        'canonicalId',
        'currentId',
        'parentId',
        'secondParentId',
        'formId',
        'formInstanceId',
        'file',
        'fileUrl',
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
  Signature.init(
    {
      formInstanceId: {
        type: DataTypes.UUID,
        field: 'form_instance_id',
      },
      file: DataTypes.STRING,
      fileUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.assetUrl('file');
        },
      },
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
      modelName: 'Signature',
      tableName: 'signatures',
      underscored: true,
    }
  );

  Signature.beforeSave(async (record, options) => {
    await record.validateNemsisData('eOther_v3.xsd', 'eOther', 'eOther.SignatureGroup', options);
  });

  Signature.afterSave(async (signature, options) => {
    if (!signature.canonicalId) {
      return;
    }
    await signature.handleAssetFile('file', options);
  });

  return Signature;
};
