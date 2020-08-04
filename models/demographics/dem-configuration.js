'use strict';

const sequelizePaginate = require('sequelize-paginate')
const nemsis = require('../../lib/nemsis');

module.exports = (sequelize, DataTypes) => {
  const DemConfiguration = sequelize.define('DemConfiguration', {
    stateName: {
      type: DataTypes.STRING,
      field: 'state_name'
    },
    data: DataTypes.JSONB,
    isValid: {
      type: DataTypes.BOOLEAN,
      field: 'is_valid'
    }
  }, {
    schema: 'demographics',
    tableName: 'configurations',
    underscored: true,
    validate: {
      schema: async function() {
        this.validationError = await nemsis.validateSchema('dConfiguration_v3.xsd', 'dConfiguration', 'dConfiguration.ConfigurationGroup', this.data);
      }
    }
  });
  DemConfiguration.associate = function(models) {
    DemConfiguration.belongsTo(models.DemAgency, {as: 'agency'});
    DemConfiguration.belongsTo(models.State, {as: 'state'});
    DemConfiguration.belongsTo(models.User, {as: 'updatedBy'});
    DemConfiguration.belongsTo(models.User, {as: 'createdBy'});

    DemConfiguration.beforeSave(async function(record, options) {
      if (!record.id) {
        record.setDataValue('id', record.data?._attributes?.UUID);
      }
      record.setDataValue('stateId', record.data?.['dConfiguration.01']?._text);
      record.setDataValue('isValid', record.data?._attributes?.['pr:isValid']);
    });
  };
  sequelizePaginate.paginate(DemConfiguration);
  return DemConfiguration;
};
