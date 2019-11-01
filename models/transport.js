'use strict';
module.exports = (sequelize, DataTypes) => {
  const Transport = sequelize.define('Transport', {
    name: DataTypes.STRING
  }, {
    tableName: 'transports',
    underscored: true
  });
  Transport.associate = function(models) {
    // associations can be defined here
    Transport.belongsTo(models.User, {as: 'updatedBy'});
    Transport.belongsTo(models.User, {as: 'createdBy'});
    Transport.hasMany(models.Patient, {as: 'patients', foreignKey: 'transportMethodId'});
    Transport.hasMany(models.Observation, {as: 'observations', foreignKey: 'transportMethodId'});
  };
  return Transport;
};
