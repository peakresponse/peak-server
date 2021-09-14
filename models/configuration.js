const sequelizePaginate = require('sequelize-paginate');
const nemsis = require('../lib/nemsis');
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
      validate: {
        async schema() {
          this.validationError = await nemsis.validateSchema(
            'dConfiguration_v3.xsd',
            'dConfiguration',
            'dConfiguration.ConfigurationGroup',
            this.data
          );
          this.isValid = this.validationError === null;
        },
      },
    }
  );

  Configuration.beforeSave(async (record) => {
    if (!record.id) {
      record.setDataValue('id', record.data?._attributes?.UUID);
    }
    record.setDataValue('stateId', record.data?.['dConfiguration.01']?._text);
  });

  sequelizePaginate.paginate(Configuration);

  return Configuration;
};
