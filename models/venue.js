const sequelizePaginate = require('sequelize-paginate');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Venue extends Base {
    static associate(models) {
      Venue.hasMany(models.Event, { as: 'event', foreignKey: 'venueId' });
      Venue.hasMany(models.Facility, { as: 'facility' });
      Venue.belongsTo(models.City, { as: 'city' });
      Venue.belongsTo(models.County, { as: 'county' });
      Venue.belongsTo(models.State, { as: 'state' });
      Venue.belongsTo(models.User, { as: 'updatedBy' });
      Venue.belongsTo(models.User, { as: 'createdBy' });
      Venue.belongsTo(models.Agency, { as: 'createdByAgency' });
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
