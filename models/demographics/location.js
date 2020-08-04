'use strict';

const sequelizePaginate = require('sequelize-paginate')
const nemsis = require('../../lib/nemsis');

module.exports = (sequelize, DataTypes) => {
  const Location = sequelize.define('Location', {
    type: DataTypes.STRING,
    name: DataTypes.STRING,
    number: DataTypes.STRING,
    geog: DataTypes.GEOMETRY,
    data: DataTypes.JSONB,
    isValid: {
      type: DataTypes.BOOLEAN,
      field: 'is_valid'
    }
  }, {
    schema: 'demographics',
    tableName: 'locations',
    underscored: true,
    validate: {
      schema: async function() {
        this.validationError = await nemsis.validateSchema('dLocation_v3.xsd', 'dLocation', 'dLocation.LocationGroup', this.data);
        if (this.validationError) throw this.validationError;
      }
    }
  });
  Location.associate = function(models) {
    Location.belongsTo(models.DemAgency, {as: 'agency'});
    Location.belongsTo(models.User, {as: 'updatedBy'});
    Location.belongsTo(models.User, {as: 'createdBy'});

    Location.beforeSave(async function(record, options) {
      if (!record.id) {
        record.setDataValue('id', record.data?._attributes?.UUID);
      }
      record.setDataValue('type', record.data?.['dLocation.01']?._text);
      record.setDataValue('name', record.data?.['dLocation.02']?._text);
      record.setDataValue('number', record.data?.['dLocation.03']?._text);
      record.setDataValue('geog', models.helpers.data.geometryFor(record.data?.['dLocation.04']?._text));
      record.setDataValue('isValid', record.data?._attributes?.['pr:isValid']);
    });
  };
  sequelizePaginate.paginate(Location);
  return Location;
};
