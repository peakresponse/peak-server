'use strict';

const sequelizePaginate = require('sequelize-paginate')
const nemsis = require('../../lib/nemsis');

module.exports = (sequelize, DataTypes) => {
  const DemFacility = sequelize.define('DemFacility', {
    type: DataTypes.STRING,
    name: DataTypes.STRING,
    locationCode: {
      type: DataTypes.STRING,
      field: 'location_code'
    },
    primaryDesignation: {
      type: DataTypes.STRING,
      field: 'primary_designation'
    },
    primaryNationalProviderId: {
      type: DataTypes.STRING,
      field: 'primary_national_provider_id'
    },
    address: DataTypes.STRING,
    cityName: {
      type: DataTypes.STRING,
      field: 'city_name'
    },
    stateName: {
      type: DataTypes.STRING,
      field: 'state_name'
    },
    zip: DataTypes.STRING,
    countyName: {
      type: DataTypes.STRING,
      field: 'county_name'
    },
    country: DataTypes.STRING,
    geog: DataTypes.GEOMETRY,
    primaryPhone: {
      type: DataTypes.STRING,
      field: 'primary_phone'
    },
    data: DataTypes.JSONB,
    isValid: {
      type: DataTypes.BOOLEAN,
      field: 'is_valid'
    }
  }, {
    schema: 'demographics',
    tableName: 'facilities',
    underscored: true,
    validate: {
      schema: async function() {
        this.validationError = await nemsis.validateSchema('dFacility_v3.xsd', 'dFacility', 'dFacilityGroup', this.data);
        if (this.validationError) throw this.validationError;
      }
    }
  });
  DemFacility.associate = function(models) {
    DemFacility.belongsTo(models.DemAgency, {as: 'agency'});
    DemFacility.belongsTo(models.Facility, {as: 'facility'});
    DemFacility.belongsTo(models.City, {as: 'city'});
    DemFacility.belongsTo(models.County, {as: 'county'});
    DemFacility.belongsTo(models.State, {as: 'state'});
    DemFacility.belongsTo(models.User, {as: 'updatedBy'});
    DemFacility.belongsTo(models.User, {as: 'createdBy'});

    DemFacility.beforeSave(async function(record, options) {
      if (!record.id) {
        record.setDataValue('id', record.data?._attributes?.UUID);
      }
      record.setDataValue('type', record.data?.['dFacility.01']?._text);
      record.setDataValue('name', record.data?.['dFacility.FacilityGroup']?.['dFacility.02']?._text);
      record.setDataValue('locationCode', record.data?.['dFacility.FacilityGroup']?.['dFacility.03']?._text);
      record.setDataValue('primaryDesignation', models.helpers.data.firstValueOf(record.data?.['dFacility.FacilityGroup']?.['dFacility.04']));
      record.setDataValue('primaryNationalProviderId', models.helpers.data.firstValueOf(record.data?.['dFacility.FacilityGroup']?.['dFacility.05']));
      record.setDataValue('address', record.data?.['dFacility.FacilityGroup']?.['dFacility.07']?._text);
      record.setDataValue('cityId', record.data?.['dFacility.FacilityGroup']?.['dFacility.08']?._text);
      record.setDataValue('stateId', record.data?.['dFacility.FacilityGroup']?.['dFacility.09']?._text);
      record.setDataValue('zip', record.data?.['dFacility.FacilityGroup']?.['dFacility.10']?._text);
      record.setDataValue('countyId', record.data?.['dFacility.FacilityGroup']?.['dFacility.11']?._text);
      record.setDataValue('country', record.data?.['dFacility.FacilityGroup']?.['dFacility.12']?._text);
      record.setDataValue('primaryPhone', models.helpers.data.firstValueOf(record.data?.['dFacility.FacilityGroup']?.['dFacility.15']));
      record.setDataValue('geog', models.helpers.data.geometryFor(record.data?.['dFacility.FacilityGroup']?.['dFacility.13']?._text));
      record.setDataValue('isValid', record.data?._attributes?.['pr:isValid']);
    });
  };
  sequelizePaginate.paginate(DemFacility);
  return DemFacility;
};
