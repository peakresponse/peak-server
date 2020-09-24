const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class County extends Model {}

  County.init(
    {
      stateAbbr: {
        type: DataTypes.STRING,
        field: 'state_abbr',
      },
      stateCode: {
        type: DataTypes.STRING,
        field: 'state_code',
      },
      countyCode: {
        type: DataTypes.STRING,
        field: 'county_code',
      },
      fullCode: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ['stateCode', 'countyCode']),
        get() {
          return `${this.stateCode}${this.countyCode}`;
        },
      },
      name: DataTypes.STRING,
      classCode: {
        type: DataTypes.STRING,
        field: 'class_code',
      },
    },
    {
      sequelize,
      modelName: 'County',
      tableName: 'counties',
      underscored: true,
    }
  );

  return County;
};
