'use strict';
module.exports = (sequelize, DataTypes) => {
  const Destination = sequelize.define('Destination', {
    name: DataTypes.STRING,
    placeData: {
      type: DataTypes.JSONB,
      field: 'place_data'
    },
  }, {
    tableName: 'destinations',
    underscored: true
  });
  Destination.associate = function(models) {
    // associations can be defined here
    Destination.belongsTo(models.User, {as: 'updatedBy'});
    Destination.belongsTo(models.User, {as: 'createdBy'});
    Destination.hasMany(models.Patient, {as: 'patients', foreignKey: 'transportToId'});
    Destination.hasMany(models.Observation, {as: 'observations', foreignKey: 'transportToId'});
  };
  return Destination;
};
