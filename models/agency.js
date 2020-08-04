'use strict';

const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, DataTypes) => {
  const Agency = sequelize.define('Agency', {
    stateUniqueId: {
      type: DataTypes.STRING,
      field: 'state_unique_id'
    },
    number: DataTypes.STRING,
    name: DataTypes.STRING,
    data: DataTypes.JSONB,
  }, {
    tableName: 'agencies',
    underscored: true,
  });
  Agency.associate = function(models) {
    Agency.belongsTo(models.State, {as: 'state'});
    Agency.belongsTo(models.User, {as: 'updatedBy'});
    Agency.belongsTo(models.User, {as: 'createdBy'});
    Agency.hasMany(models.Observation, {as: 'observations', foreignKey: 'transportAgencyId'});
    Agency.hasMany(models.Patient, {as: 'patients', foreignKey: 'transportAgencyId'});
    Agency.hasOne(models.DemAgency, {as: 'agency', foreignKey: 'agencyId'});

    Agency.prototype.generateSubdomain = async function() {
      /// count the number of words
      const tokens = this.name.replace(/[^\w ]|_/g, '').split(/\s+/);
      /// either use the full name or an acronym of first letters depending on number of words
      const name = tokens.length < 4 ? this.name : tokens.map(t => t.charAt(0)).join('');
      /// remove whitespace/symbols to generate subdomain
      let subdomain = name.toLowerCase().replace(/[^\w]|_/g, '');
      let index = 1;
      while (await models.DemAgency.findOne({where: {subdomain}})) {
        /// add numeric index until unique subdomain found
        subdomain = `${name.toLowerCase().replace(/[^\w]|_/g, '')}${index}`;
        index += 1;
      }
      return subdomain;
    }
  };
  Agency.prototype.toJSON = function() {
    let attributes = Object.assign({}, this.get());
    /// by default, don't return the large attributes
    delete attributes.data;
    return attributes;
  };
  sequelizePaginate.paginate(Agency);
  return Agency;
};
