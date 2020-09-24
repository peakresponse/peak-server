const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class City extends Model {}

  City.init(
    {
      featureName: {
        type: DataTypes.STRING,
        field: 'feature_name',
      },
      featureClass: {
        type: DataTypes.STRING,
        field: 'feature_class',
      },
      censusCode: {
        type: DataTypes.STRING,
        field: 'census_code',
      },
      censusClassCode: {
        type: DataTypes.STRING,
        field: 'census_class_code',
      },
      gsaCode: {
        type: DataTypes.STRING,
        field: 'gsa_code',
      },
      opmCode: {
        type: DataTypes.STRING,
        field: 'opm_code',
      },
      stateNumeric: {
        type: DataTypes.STRING,
        field: 'state_numeric',
      },
      stateAlpha: {
        type: DataTypes.STRING,
        field: 'state_alpha',
      },
      countySequence: {
        type: DataTypes.STRING,
        field: 'county_sequence',
      },
      countyNumeric: {
        type: DataTypes.STRING,
        field: 'county_numeric',
      },
      countyName: {
        type: DataTypes.STRING,
        field: 'county_name',
      },
      primaryLatitude: {
        type: DataTypes.STRING,
        field: 'primary_latitude',
      },
      primaryLongitude: {
        type: DataTypes.STRING,
        field: 'primary_longitude',
      },
      dateCreated: {
        type: DataTypes.STRING,
        field: 'date_created',
      },
      dateEdited: {
        type: DataTypes.STRING,
        field: 'date_edited',
      },
    },
    {
      sequelize,
      modelName: 'City',
      tableName: 'cities',
      underscored: true,
    }
  );

  return City;
};
