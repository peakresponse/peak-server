const sequelizePaginate = require('sequelize-paginate');
const nemsis = require('../lib/nemsis');
const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Location extends Base {
    static associate(models) {
      Location.belongsTo(models.User, { as: 'updatedBy' });
      Location.belongsTo(models.User, { as: 'createdBy' });
      Location.belongsTo(models.Agency, { as: 'createdByAgency' });
    }
  }

  Location.init(
    {
      type: DataTypes.STRING,
      name: DataTypes.STRING,
      number: DataTypes.STRING,
      geog: DataTypes.GEOGRAPHY,
      data: DataTypes.JSONB,
      isValid: {
        type: DataTypes.BOOLEAN,
        field: 'is_valid',
      },
    },
    {
      sequelize,
      modelName: 'Location',
      tableName: 'locations',
      underscored: true,
      validate: {
        async schema() {
          this.validationError = await nemsis.validateSchema('dLocation_v3.xsd', 'dLocation', 'dLocation.LocationGroup', this.data);
          if (this.validationError) throw this.validationError;
        },
      },
    }
  );

  Location.beforeSave(async (record) => {
    if (!record.id) {
      record.setDataValue('id', record.data?._attributes?.UUID);
    }
    record.setDataValue('type', record.data?.['dLocation.01']?._text);
    record.setDataValue('name', record.data?.['dLocation.02']?._text);
    record.setDataValue('number', record.data?.['dLocation.03']?._text);
    record.setDataValue('geog', Base.geometryFor(record.data?.['dLocation.04']?._text));
    record.setDataValue('isValid', record.data?._attributes?.['pr:isValid']);
  });

  sequelizePaginate.paginate(Location);

  return Location;
};
