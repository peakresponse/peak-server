'use strict';

const sequelizePaginate = require('sequelize-paginate')
const GoogleMapsClient = require("@googlemaps/google-maps-services-js").Client;

module.exports = (sequelize, DataTypes) => {
  const Facility = sequelize.define('Facility', {
    type: DataTypes.STRING,
    name: DataTypes.STRING,
    stateCode: {
      type: DataTypes.STRING,
      field: 'state_code'
    },
    code: DataTypes.STRING,
    unit: DataTypes.STRING,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zip: DataTypes.STRING,
    country: DataTypes.STRING,
    lat: {
      type: DataTypes.STRING,
    },
    lng: {
      type: DataTypes.STRING,
    },
    geog: {
      type: DataTypes.GEOMETRY,
    },
    dataSet: {
      type: DataTypes.JSONB,
      field: 'data_set'
    }
  }, {
    tableName: 'facilities',
    underscored: true,
  });
  Facility.associate = function(models) {
    // associations can be defined here
    Facility.belongsTo(models.Agency, {as: 'agency'});
    Facility.hasMany(models.Patient, {as: 'patients', foreignKey: 'transportFacilityId'});
    Facility.hasMany(models.Observation, {as: 'observations', foreignKey: 'transportFacilityId'});
  };
  Facility.beforeSave(function(facility, options) {
    /// update internal geog column as needed
    if (facility.lat && facility.lng) {
      facility.geog = {type: 'Point', coordinates:[parseFloat(facility.lng), parseFloat(facility.lat)]};
    } else {
      facility.geog = null;
    }
  });
  Facility.prototype.toJSON = function() {
    let attributes = Object.assign({}, this.get());
    /// by default, don't return the large attributes
    delete attributes.dataSet;
    delete attributes.geog;
    return attributes;
  };
  Facility.prototype.geocode = async function() {
    if (this.address && this.city && this.state) {
      const client = new GoogleMapsClient();
      const response = await client.geocode({
          params: {
            address: `${this.address}, ${this.city}, ${this.state}`,
            key: process.env.GOOGLE_MAPS_API_KEY
          }
        });
      if (response.data && response.data.results && response.data.results.length > 0) {
        /// take the (usually only) first result
        const result = response.data.results[0];
        if (result.geometry && result.geometry.location) {
          this.lat = result.geometry.location.lat;
          this.lng = result.geometry.location.lng;
        }
      }
    }
  };
  Facility.findNear = function(lat, lng, options) {
    options = options || {};
    options.order = sequelize.literal(`"Facility".geog <-> ST_MakePoint(${lng}, ${lat})::geography`);
    return Facility.paginate(options);
  };
  sequelizePaginate.paginate(Facility);
  return Facility;
};
