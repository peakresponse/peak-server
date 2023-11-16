const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Response extends Base {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Response.belongsTo(models.Version, { as: 'version' });
      Response.belongsTo(Response, { as: 'canonical' });
      Response.belongsTo(Response, { as: 'current' });
      Response.belongsTo(Response, { as: 'parent' });
      Response.belongsTo(Response, { as: 'secondParent' });
      Response.belongsTo(models.User, { as: 'createdBy' });
      Response.belongsTo(models.User, { as: 'updatedBy' });
      Response.belongsTo(models.Agency, { as: 'createdByAgency' });
      Response.belongsTo(models.Agency, { as: 'updatedByAgency' });
    }

    static createOrUpdate(user, agency, data, options) {
      return Base.createOrUpdate(Response, user, agency, data, [], ['data'], options);
    }
  }
  Response.init(
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
      modelName: 'Response',
      tableName: 'responses',
      underscored: true,
    }
  );

  Response.beforeSave(async (record, options) => {
    await record.validateNemsisData('eResponse_v3.xsd', 'eResponse', null, options);
  });

  return Response;
};
