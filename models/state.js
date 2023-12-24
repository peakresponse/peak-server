const { Model } = require('sequelize');

const States = require('../lib/states');

module.exports = (sequelize, DataTypes) => {
  class State extends Model {
    static associate(models) {
      // associations can be defined here
      State.hasMany(models.Agency, { as: 'agencies', foreignKey: 'stateId' });
    }

    static getAbbrForCode(code) {
      return States.codeMapping[code]?.abbr;
    }

    static getCodeForAbbr(abbr) {
      return States.abbrMapping[abbr.toUpperCase()]?.code;
    }

    static getCodeForName(name) {
      return States.nameMapping[name]?.code;
    }

    static getNameForCode(code) {
      return States.codeMapping[code]?.name;
    }

    toJSON() {
      const attributes = { ...this.get() };
      // by default, don't return the large attributes
      delete attributes.dataSet;
      delete attributes.dataSetXml;
      delete attributes.schematronXml;
      return attributes;
    }
  }

  State.init(
    {
      name: DataTypes.STRING,
      abbr: {
        type: DataTypes.VIRTUAL(DataTypes.STRING),
        get() {
          return State.getAbbrForCode(this.id);
        },
      },
      borderStates: {
        type: DataTypes.JSONB,
        field: 'border_states',
      },
      isConfigured: DataTypes.BOOLEAN,
      dataSet: {
        type: DataTypes.JSONB,
        field: 'data_set',
      },
      dataSetXml: {
        type: DataTypes.TEXT,
        field: 'data_set_xml',
      },
      schematronXml: {
        type: DataTypes.TEXT,
        field: 'schematron_xml',
      },
    },
    {
      sequelize,
      modelName: 'State',
      tableName: 'states',
      underscored: true,
      defaultScope: {
        attributes: {
          exclude: ['dataSet', 'dataSetXml', 'schematronXml'],
        },
      },
    },
  );

  return State;
};
