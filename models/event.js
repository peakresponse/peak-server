const _ = require('lodash');
const sequelizePaginate = require('sequelize-paginate');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Event extends Base {
    static associate(models) {
      Event.belongsTo(models.Venue, { as: 'venue', foreignKey: 'venueId' });
      Event.belongsToMany(models.Agency, { as: 'agencies', through: 'events_agencies', timestamps: false });
      Event.belongsTo(models.User, { as: 'updatedBy' });
      Event.belongsTo(models.User, { as: 'createdBy' });
      Event.belongsTo(models.Agency, { as: 'createdByAgency' });
    }

    toJSON() {
      const attributes = { ...this.get() };
      if (this.venue) {
        attributes.venue = this.venue.toJSON();
      }
      return _.pick(attributes, [
        'id',
        'name',
        'description',
        'startTime',
        'endTime',
        'venue',
        'venueId',
        'createdById',
        'updatedById',
        'createdByAgencyId',
      ]);
    }
  }

  Event.init(
    {
      name: DataTypes.TEXT,
      description: DataTypes.TEXT,
      startTime: DataTypes.DATE,
      endTime: DataTypes.DATE,
      archivedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Event',
      tableName: 'events',
      underscored: true,
    },
  );

  sequelizePaginate.paginate(Event);

  return Event;
};
