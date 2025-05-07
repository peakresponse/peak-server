const _ = require('lodash');
const sequelizePaginate = require('sequelize-paginate');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Venue extends Base {
    static associate(models) {
      Venue.hasMany(models.Event, { as: 'event', foreignKey: 'venueId' });
      Venue.hasMany(models.Facility, { as: 'facilities' });
      Venue.belongsTo(models.Region, { as: 'region' });
      Venue.belongsTo(models.City, { as: 'city' });
      Venue.belongsTo(models.County, { as: 'county' });
      Venue.belongsTo(models.State, { as: 'state' });
      Venue.belongsTo(models.User, { as: 'updatedBy' });
      Venue.belongsTo(models.User, { as: 'createdBy' });
      Venue.belongsTo(models.Agency, { as: 'createdByAgency' });
    }

    toJSON() {
      const attributes = { ...this.get() };
      if (this.city) {
        attributes.city = this.city.toJSON();
      }
      if (this.county) {
        attributes.county = this.county.toJSON();
      }
      if (this.state) {
        attributes.state = this.state.toJSON();
      }
      if (this.region) {
        attributes.region = this.region.toJSON();
      }
      if (this.facilities) {
        attributes.facilities = this.facilities.map((f) => f.toJSON());
        attributes.facilityIds = this.facilities.map((f) => f.id);
      }
      return _.pick(attributes, [
        'id',
        'type',
        'name',
        'address1',
        'address2',
        'city',
        'cityId',
        'county',
        'countyId',
        'state',
        'stateId',
        'zipCode',
        'region',
        'regionId',
        'archivedAt',
        'createdAt',
        'createdById',
        'updatedAt',
        'updatedById',
        'createdByAgencyId',
        'facilities',
        'facilityIds',
      ]);
    }
  }

  Venue.init(
    {
      type: DataTypes.TEXT,
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      address1: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      address2: DataTypes.TEXT,
      zipCode: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      archivedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Venue',
      tableName: 'venues',
      underscored: true,
    },
  );

  sequelizePaginate.paginate(Venue);

  return Venue;
};
