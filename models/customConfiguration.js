const sequelizePaginate = require('sequelize-paginate');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class CustomConfiguration extends Base {
    static get xsdPath() {
      return 'dCustom_v3.xsd';
    }

    static get rootTag() {
      return 'dCustomConfiguration';
    }

    static get groupTag() {
      return 'dCustomConfiguration.CustomGroup';
    }

    static associate(models) {
      CustomConfiguration.belongsTo(CustomConfiguration, { as: 'draftParent' });
      CustomConfiguration.hasOne(CustomConfiguration, { as: 'draft', foreignKey: 'draftParentId' });
      CustomConfiguration.belongsTo(models.User, { as: 'updatedBy' });
      CustomConfiguration.belongsTo(models.User, { as: 'createdBy' });
      CustomConfiguration.belongsTo(models.Agency, { as: 'createdByAgency' });
      CustomConfiguration.belongsTo(models.Version, { as: 'version' });
    }
  }

  CustomConfiguration.init(
    {
      isDraft: DataTypes.BOOLEAN,
      customElementId: DataTypes.STRING,
      nemsisElement: DataTypes.STRING,
      dataSet: DataTypes.STRING,
      data: DataTypes.JSONB,
      isValid: DataTypes.BOOLEAN,
      validationErrors: DataTypes.JSONB,
      archivedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'CustomConfiguration',
      tableName: 'custom_configurations',
      underscored: true,
    },
  );

  CustomConfiguration.addDraftScopes();

  CustomConfiguration.beforeValidate(async (record, options) => {
    record.syncFieldAndNemsisAttributeValue('customElementId', [], 'CustomElementID', options);
    record.syncFieldAndNemsisAttributeValue('nemsisElement', ['dCustomConfiguration.01'], 'nemsisElement', options);
    // set dataSet based on data keys
    const key = Object.keys(record.data).filter((k) => !k.startsWith('_'))[0];
    if (key.startsWith('dCustomConfiguration.')) {
      record.setDataValue('dataSet', 'DEMDataSet');
    } else if (key.startsWith('eCustomConfiguration.')) {
      record.setDataValue('dataSet', 'EMSDataSet');
    }
    if (record.changed('dataSet')) {
      options.fields = options.fields || [];
      if (options.fields.indexOf('dataSet') < 0) {
        options.fields.push('dataSet');
      }
    }
    await record.xsdValidate(options);
  });

  sequelizePaginate.paginate(CustomConfiguration);

  return CustomConfiguration;
};
