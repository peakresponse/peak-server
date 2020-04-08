'use strict';
module.exports = (sequelize, DataTypes) => {
  const County = sequelize.define('County', {
    stateAbbr: {
      type: DataTypes.STRING,
      field: 'state_abbr'
    },
    stateCode: {
      type: DataTypes.STRING,
      field: 'state_code'
    },
    countyCode: {
      type: DataTypes.STRING,
      field: 'county_code'
    },
    fullCode: {
      type: DataTypes.VIRTUAL(DataTypes.STRING, ['stateCode', 'countyCode']),
      get: function() {
        return `${this.stateCode}${this.countyCode}`;
      },
      set: function(value) {
        throw new Error();
      }
    },
    name: DataTypes.STRING,
    classCode: {
      type: DataTypes.STRING,
      field: 'class_code'
    }
  }, {
    tableName: 'counties',
    underscored: true,
  });
  County.associate = function(models) {
    // associations can be defined here
  };
  County.prototype.code
  return County;
};
