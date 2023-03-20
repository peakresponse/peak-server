const sequelizePaginate = require('sequelize-paginate');
const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Configuration extends Base {
    static associate(models) {
      Configuration.belongsTo(models.State, { as: 'state' });
      Configuration.belongsTo(models.User, { as: 'updatedBy' });
      Configuration.belongsTo(models.User, { as: 'createdBy' });
      Configuration.belongsTo(models.Agency, { as: 'createdByAgency' });
    }
  }

  Configuration.init(
    {
      stateName: {
        type: DataTypes.STRING,
        field: 'state_name',
      },
      data: DataTypes.JSONB,
      isValid: {
        type: DataTypes.BOOLEAN,
        field: 'is_valid',
      },
    },
    {
      sequelize,
      modelName: 'Configuration',
      tableName: 'configurations',
      underscored: true,
    }
  );

  Configuration.beforeSave(async (record, options) => {
    record.syncNemsisId(options);
    record.syncFieldAndNemsisValue('stateId', ['dConfiguration.01'], options);
    await record.validateNemsisData('dConfiguration_v3.xsd', 'dConfiguration', 'dConfiguration.ConfigurationGroup', options);
  });

  sequelizePaginate.paginate(Configuration);

  return Configuration;
};
