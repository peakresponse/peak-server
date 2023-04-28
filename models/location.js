const sequelizePaginate = require('sequelize-paginate');
const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Location extends Base {
    static get xsdPath() {
      return 'dLocation_v3.xsd';
    }

    static get rootTag() {
      return 'dLocation';
    }

    static get groupTag() {
      return 'dLocation.LocationGroup';
    }

    static associate(models) {
      Location.belongsTo(Location, { as: 'draftParent' });
      Location.hasOne(Location, { as: 'draft', foreignKey: 'draftParentId' });
      Location.belongsTo(models.User, { as: 'updatedBy' });
      Location.belongsTo(models.User, { as: 'createdBy' });
      Location.belongsTo(models.Agency, { as: 'createdByAgency' });
      Location.belongsTo(models.Version, { as: 'version' });
    }
  }

  Location.init(
    {
      isDraft: DataTypes.BOOLEAN,
      type: DataTypes.STRING,
      name: DataTypes.STRING,
      number: DataTypes.STRING,
      geog: DataTypes.GEOGRAPHY,
      data: DataTypes.JSONB,
      isValid: DataTypes.BOOLEAN,
      validationErrors: DataTypes.JSONB,
      archivedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'Location',
      tableName: 'locations',
      underscored: true,
    }
  );

  Location.addDraftScopes();

  Location.beforeSave(async (record, options) => {
    record.syncNemsisId(options);
    record.syncFieldAndNemsisValue('type', ['dLocation.01'], options);
    record.syncFieldAndNemsisValue('name', ['dLocation.02'], options);
    record.syncFieldAndNemsisValue('number', ['dLocation.03'], options);
    record.setDataValue('geog', Base.geometryFor(record.data?.['dLocation.04']?._text));
    await record.xsdValidate(options);
  });

  sequelizePaginate.paginate(Location);

  return Location;
};
