const sequelizePaginate = require('sequelize-paginate');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Configuration extends Base {
    static get xsdPath() {
      return 'dConfiguration_v3.xsd';
    }

    static get rootTag() {
      return 'dConfiguration';
    }

    static get groupTag() {
      return 'dConfiguration.ConfigurationGroup';
    }

    static associate(models) {
      Configuration.belongsTo(Configuration, { as: 'draftParent' });
      Configuration.hasOne(Configuration, { as: 'draft', foreignKey: 'draftParentId' });
      Configuration.belongsTo(models.State, { as: 'state' });
      Configuration.belongsTo(models.User, { as: 'updatedBy' });
      Configuration.belongsTo(models.User, { as: 'createdBy' });
      Configuration.belongsTo(models.Agency, { as: 'createdByAgency' });
      Configuration.belongsTo(models.Version, { as: 'version' });
    }
  }

  Configuration.init(
    {
      isDraft: {
        type: DataTypes.BOOLEAN,
      },
      data: {
        type: DataTypes.JSONB,
      },
      isValid: {
        type: DataTypes.BOOLEAN,
      },
      validationErrors: {
        type: DataTypes.JSONB,
      },
      archivedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: 'Configuration',
      tableName: 'configurations',
      underscored: true,
    },
  );

  Configuration.addDraftScopes();

  Configuration.beforeValidate(async (record, options) => {
    record.syncNemsisId(options);
    record.syncFieldAndNemsisValue('stateId', ['dConfiguration.01'], options);
    await record.xsdValidate(options);
  });

  sequelizePaginate.paginate(Configuration);

  return Configuration;
};
