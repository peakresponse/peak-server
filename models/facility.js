const sequelizePaginate = require('sequelize-paginate');
const GoogleMapsClient = require('@googlemaps/google-maps-services-js').Client;
const { v5: uuidv5 } = require('uuid');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Facility extends Base {
    static get xsdPath() {
      return 'dFacility_v3.xsd';
    }

    static get rootTag() {
      return 'dFacility';
    }

    static get groupTag() {
      return 'dFacilityGroup';
    }

    static associate(models) {
      Facility.belongsTo(models.Version, { as: 'version' });
      Facility.belongsTo(Facility, { as: 'draftParent' });
      Facility.hasOne(Facility, { as: 'draft', foreignKey: 'draftParentId' });
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
    }

    static findNear(lat, lng, options = {}) {
      options.order = sequelize.literal(`"Facility".geog <-> ST_MakePoint(${lng}, ${lat})::geography`);
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
        if (response.data && response.data.results && response.data.results.length > 0) {
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
      isDraft: DataTypes.BOOLEAN,
      type: DataTypes.STRING,
      name: DataTypes.STRING,
      locationCode: DataTypes.STRING,
      primaryDesignation: DataTypes.STRING,
      primaryNationalProviderId: DataTypes.STRING,
      unit: DataTypes.STRING,
      address: DataTypes.STRING,
      cityName: DataTypes.STRING,
      stateName: DataTypes.STRING,
      zip: DataTypes.STRING,
      countyName: DataTypes.STRING,
      country: DataTypes.STRING,
      lat: {
        type: DataTypes.VIRTUAL(DataTypes.STRING),
        get() {
          return this.geog?.coordinates?.[1]?.toString();
        },
        set(newValue) {
          const geog = this.geog || { type: 'Point', coordinates: [0, 0] };
          geog.coordinates[1] = parseFloat(newValue.toString());
          this.setDataValue('geog', geog);
          const type = this.createdByAgencyId ? 'dFacility' : 'sFacility';
          this.setNemsisValue([`${type}.FacilityGroup`, `${type}.13`], `${geog.coordinates[1]},${geog.coordinates[0]}`);
        },
      },
      lng: {
        type: DataTypes.VIRTUAL(DataTypes.STRING),
        get() {
          return this.geog?.coordinates?.[0]?.toString();
        },
        set(newValue) {
          const geog = this.geog || { type: 'Point', coordinates: [0, 0] };
          geog.coordinates[0] = parseFloat(newValue.toString());
          this.setDataValue('geog', geog);
          const type = this.createdByAgencyId ? 'dFacility' : 'sFacility';
          this.setNemsisValue([`${type}.FacilityGroup`, `${type}.13`], `${geog.coordinates[1]},${geog.coordinates[0]}`);
        },
      },
      geog: DataTypes.GEOGRAPHY,
      primaryPhone: DataTypes.STRING,
      data: DataTypes.JSONB,
      isValid: DataTypes.BOOLEAN,
      validationErrors: DataTypes.JSONB,
      archivedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Facility',
      tableName: 'facilities',
      underscored: true,
    },
  );

  Facility.addDraftScopes();

  Facility.addScope('canonical', {
    where: { createdByAgencyId: null },
  });

  Facility.beforeSave(async (record, options) => {
    const type = record.createdByAgencyId ? 'dFacility' : 'sFacility';
    record.syncFieldAndNemsisValue('type', [`${type}.01`], options);
    if (record.createdByAgencyId) {
      // generate a deterministic but unique id for this agency and facility type
      record.setNemsisAttributeValue([], 'UUID', uuidv5(record.getDataValue('type') ?? '', record.createdByAgencyId));
      // sync the facility id into the inner group
      record.syncNemsisId(options, [`${type}.FacilityGroup`]);
    }
    record.syncFieldAndNemsisValue('name', [`${type}.FacilityGroup`, `${type}.02`], options);
    record.syncFieldAndNemsisValue('locationCode', [`${type}.FacilityGroup`, `${type}.03`], options);
    record.syncFieldAndNemsisValue('primaryDesignation', [`${type}.FacilityGroup`, `${type}.04`], options);
    record.syncFieldAndNemsisValue('primaryNationalProviderId', [`${type}.FacilityGroup`, `${type}.05`], options);
    record.syncFieldAndNemsisValue('unit', [`${type}.FacilityGroup`, `${type}.06`], options);
    record.syncFieldAndNemsisValue('address', [`${type}.FacilityGroup`, `${type}.07`], options);
    record.syncFieldAndNemsisValue('cityId', [`${type}.FacilityGroup`, `${type}.08`], options);
    record.setDataValue(
      'cityName',
      await sequelize.models.City.getName(record.getFirstNemsisValue([`${type}.FacilityGroup`, `${type}.08`]), options),
    );
    record.syncFieldAndNemsisValue('stateId', [`${type}.FacilityGroup`, `${type}.09`], options);
    record.setDataValue(
      'stateName',
      await sequelize.models.State.getNameForCode(record.getFirstNemsisValue([`${type}.FacilityGroup`, `${type}.09`]), options),
    );
    record.syncFieldAndNemsisValue('zip', [`${type}.FacilityGroup`, `${type}.10`], options);
    record.syncFieldAndNemsisValue('countyId', [`${type}.FacilityGroup`, `${type}.11`], options);
    record.setDataValue(
      'countyName',
      await sequelize.models.County.getName(record.getFirstNemsisValue([`${type}.FacilityGroup`, `${type}.11`]), options),
    );
    record.syncFieldAndNemsisValue('country', [`${type}.FacilityGroup`, `${type}.12`], options);
    record.setDataValue('geog', Base.geometryFor(record.getFirstNemsisValue([`${type}.FacilityGroup`, `${type}.13`])));
    record.syncFieldAndNemsisValue('primaryPhone', [`${type}.FacilityGroup`, `${type}.15`], options);
    if (record.createdByAgencyId) {
      await record.xsdValidate(options);
    }
  });

  sequelizePaginate.paginate(Facility);

  return Facility;
};
