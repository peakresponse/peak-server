const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class History extends Base {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      History.belongsTo(History, { as: 'canonical' });
      History.belongsTo(History, { as: 'current' });
      History.belongsTo(History, { as: 'parent' });
      History.belongsTo(History, { as: 'secondParent' });
      History.belongsTo(models.User, { as: 'createdBy' });
      History.belongsTo(models.User, { as: 'updatedBy' });
      History.belongsTo(models.Agency, { as: 'createdByAgency' });
      History.belongsTo(models.Agency, { as: 'updatedByAgency' });
    }

    static createOrUpdate(user, agency, data, options) {
      return Base.createOrUpdate(History, user, agency, data, [], ['data'], options);
    }
  }
  History.init(
    {
      data: DataTypes.JSONB,
      updatedAttributes: {
        type: DataTypes.JSONB,
        field: 'updated_attributes',
      },
      updatedDataAttributes: {
        type: DataTypes.JSONB,
        field: 'updated_data_attributes',
      },
      isValid: {
        type: DataTypes.BOOLEAN,
        field: 'is_valid',
      },
      validationErrors: {
        type: DataTypes.JSONB,
        field: 'validation_errors',
      },
    },
    {
      sequelize,
      modelName: 'History',
      tableName: 'histories',
      underscored: true,
    }
  );

  History.beforeSave(async (record, options) => {
    await record.validateNemsisData('eHistory_v3.xsd', 'eHistory', null, options);
  });

  return History;
};
