'use strict';

const StateCodes = require('../lib/codes/state');

module.exports = (sequelize, DataTypes) => {
  const State = sequelize.define('State', {
    name: DataTypes.STRING,
    abbr: {
      type: DataTypes.VIRTUAL(DataTypes.STRING),
      get() {
        return StateCodes.codeMapping[this.id].abbr;
      },
    },
    isConfigured: DataTypes.BOOLEAN,
    dataSet: {
      type: DataTypes.JSONB,
      field: 'data_set'
    },
    dataSetXml: {
      type: DataTypes.TEXT,
      field: 'data_set_xml'
    },
    schematronXml: {
      type: DataTypes.TEXT,
      field: 'schematron_xml'
    }
  }, {
    tableName: 'states',
    underscored: true,
    defaultScope: {
      attributes: {
        exclude: ['dataSet', 'dataSetXml', 'schematronXml']
      }
    }
  });
  State.associate = function(models) {
    // associations can be defined here
    State.hasMany(models.Agency, {as: 'agencies', foreignKey: 'stateId'});
  };
  State.prototype.toJSON = function() {
    let attributes = Object.assign({}, this.get());
    /// by default, don't return the large attributes
    delete attributes.dataSet;
    delete attributes.dataSetXml;
    delete attributes.schematronXml;
    return attributes;
  };
  return State;
};
