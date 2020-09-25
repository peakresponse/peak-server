const sequelizePaginate = require('sequelize-paginate');
const GoogleMapsClient = require('@googlemaps/google-maps-services-js').Client;

const nemsis = require('../lib/nemsis');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Facility extends Base {
    static associate(models) {
      Facility.belongsTo(models.Facility, { as: 'canonicalFacility' });
      Facility.belongsTo(models.City, { as: 'city' });
      Facility.belongsTo(models.County, { as: 'county' });
      Facility.belongsTo(models.State, { as: 'state' });
      Facility.belongsTo(models.User, { as: 'updatedBy' });
      Facility.belongsTo(models.User, { as: 'createdBy' });
      Facility.belongsTo(models.Agency, { as: 'createdByAgency' });

      Facility.hasMany(models.Patient, {
        as: 'patients',
        foreignKey: 'transportFacilityId',
      });
      Facility.hasMany(models.PatientObservation, {
        as: 'patientObservations',
        foreignKey: 'transportFacilityId',
      });
    }

    static findNear(lat, lng, options = {}) {
      options.order = sequelize.literal(
        `"Facility".geog <-> ST_MakePoint(${lng}, ${lat})::geography`
      );
      return Facility.paginate(options);
    }

    toJSON() {
      const attributes = { ...this.get() };
      /// by default, don't return the large attributes
      delete attributes.data;
      delete attributes.geog;
      return attributes;
    }

    async geocode() {
      if (this.address && this.cityName && this.stateName) {
        const client = new GoogleMapsClient();
        const response = await client.geocode({
          params: {
            address: `${this.address}, ${this.cityName}, ${this.stateName}`,
            key: process.env.GOOGLE_MAPS_SERVER_API_KEY,
          },
        });
        if (
          response.data &&
          response.data.results &&
          response.data.results.length > 0
        ) {
          /// take the (usually only) first result
          const result = response.data.results[0];
          if (result.geometry && result.geometry.location) {
            this.lat = `${result.geometry.location.lat}`;
            this.lng = `${result.geometry.location.lng}`;
          }
        }
      }
    }
  }

  Facility.init(
    {
      type: DataTypes.STRING,
      name: DataTypes.STRING,
      locationCode: {
        type: DataTypes.STRING,
        field: 'location_code',
      },
      primaryDesignation: {
        type: DataTypes.STRING,
        field: 'primary_designation',
      },
      primaryNationalProviderId: {
        type: DataTypes.STRING,
        field: 'primary_national_provider_id',
      },
      unit: DataTypes.STRING,
      address: DataTypes.STRING,
      cityName: {
        type: DataTypes.STRING,
        field: 'city_name',
      },
      stateName: {
        type: DataTypes.STRING,
        field: 'state_name',
      },
      zip: DataTypes.STRING,
      countyName: {
        type: DataTypes.STRING,
        field: 'county_name',
      },
      country: DataTypes.STRING,
      lat: DataTypes.STRING,
      lng: DataTypes.STRING,
      geog: DataTypes.GEOGRAPHY,
      primaryPhone: {
        type: DataTypes.STRING,
        field: 'primary_phone',
      },
      data: DataTypes.JSONB,
      isValid: {
        type: DataTypes.BOOLEAN,
        field: 'is_valid',
      },
    },
    {
      sequelize,
      modelName: 'Facility',
      tableName: 'facilities',
      underscored: true,
      validate: {
        async schema() {
          this.validationError = await nemsis.validateSchema(
            'dFacility_v3.xsd',
            'dFacility',
            'dFacilityGroup',
            this.data
          );
        },
      },
    }
  );

  Facility.beforeSave((record) => {
    if (record.createdByAgencyId) {
      if (!record.id) {
        record.setDataValue('id', record.data?._attributes?.UUID);
      }
      record.setDataValue('type', record.data?.['dFacility.01']?._text);
      record.setDataValue(
        'name',
        record.data?.['dFacility.FacilityGroup']?.['dFacility.02']?._text
      );
      record.setDataValue(
        'locationCode',
        record.data?.['dFacility.FacilityGroup']?.['dFacility.03']?._text
      );
      record.setDataValue(
        'primaryDesignation',
        Base.firstValueOf(
          record.data?.['dFacility.FacilityGroup']?.['dFacility.04']
        )
      );
      record.setDataValue(
        'primaryNationalProviderId',
        Base.firstValueOf(
          record.data?.['dFacility.FacilityGroup']?.['dFacility.05']
        )
      );
      record.setDataValue(
        'unit',
        record.data?.['dFacility.FacilityGroup']?.['dFacility.06']?._text
      );
      record.setDataValue(
        'address',
        record.data?.['dFacility.FacilityGroup']?.['dFacility.07']?._text
      );
      record.setDataValue(
        'cityId',
        record.data?.['dFacility.FacilityGroup']?.['dFacility.08']?._text
      );
      record.setDataValue(
        'stateId',
        record.data?.['dFacility.FacilityGroup']?.['dFacility.09']?._text
      );
      record.setDataValue(
        'zip',
        record.data?.['dFacility.FacilityGroup']?.['dFacility.10']?._text
      );
      record.setDataValue(
        'countyId',
        record.data?.['dFacility.FacilityGroup']?.['dFacility.11']?._text
      );
      record.setDataValue(
        'country',
        record.data?.['dFacility.FacilityGroup']?.['dFacility.12']?._text
      );
      record.setDataValue(
        'geog',
        Base.geometryFor(
          record.data?.['dFacility.FacilityGroup']?.['dFacility.13']?._text
        )
      );
      record.setDataValue(
        'primaryPhone',
        Base.firstValueOf(
          record.data?.['dFacility.FacilityGroup']?.['dFacility.15']
        )
      );
      record.setDataValue('isValid', record.data?._attributes?.['pr:isValid']);
    } else {
      // eslint-disable-next-line no-lonely-if
      if (record.lat && record.lng) {
        record.geog = {
          type: 'Point',
          coordinates: [parseFloat(record.lng), parseFloat(record.lat)],
        };
      }
    }
  });

  sequelizePaginate.paginate(Facility);

  return Facility;
};
