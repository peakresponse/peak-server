const sequelizePaginate = require('sequelize-paginate');
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
    }
  );

  Location.beforeSave(async (record, options) => {
    record.syncNemsisId(options);
    record.syncFieldAndNemsisValue('type', ['dLocation.01'], options);
    record.syncFieldAndNemsisValue('name', ['dLocation.02'], options);
    record.syncFieldAndNemsisValue('number', ['dLocation.03'], options);
    record.setDataValue('geog', Base.geometryFor(record.data?.['dLocation.04']?._text));
    await record.validateNemsisData('dLocation_v3.xsd', 'dLocation', 'dLocation.LocationGroup', options);
  });

  sequelizePaginate.paginate(Location);

  return Location;
};
