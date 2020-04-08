'use strict';

const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, DataTypes) => {
  const Agency = sequelize.define('Agency', {
    stateNumber: {
      type: DataTypes.STRING,
      field: 'state_number'
    },
    number: DataTypes.STRING,
    name: DataTypes.STRING,
    dataSet: {
      type: DataTypes.JSONB,
      field: 'data_set',
    }
  }, {
    tableName: 'agencies',
    underscored: true,
  });
  Agency.associate = function(models) {
    // associations can be defined here
    Agency.belongsTo(models.State, {as: 'state'});
    Agency.hasMany(models.Patient, {as: 'patients', foreignKey: 'transportAgencyId'});
    Agency.hasMany(models.Observation, {as: 'observations', foreignKey: 'transportAgencyId'});
  };
  Agency.prototype.toJSON = function() {
    let attributes = Object.assign({}, this.get());
    /// by default, don't return the large attributes
    delete attributes.dataSet;
    delete attributes.StateId;
    return attributes;
  };
  sequelizePaginate.paginate(Agency);
  return Agency;
};
