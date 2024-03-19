const _ = require('lodash');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Response extends Base {
    static get xsdPath() {
      return 'eResponse_v3.xsd';
    }

    static get rootTag() {
      return 'eResponse';
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Response.belongsTo(Response, { as: 'canonical' });
      Response.belongsTo(Response, { as: 'current' });
      Response.belongsTo(Response, { as: 'parent' });
      Response.belongsTo(Response, { as: 'secondParent' });
      Response.belongsTo(models.User, { as: 'createdBy' });
      Response.belongsTo(models.User, { as: 'updatedBy' });
      Response.belongsTo(models.Agency, { as: 'createdByAgency' });
      Response.belongsTo(models.Agency, { as: 'updatedByAgency' });

      Response.belongsTo(models.Agency, { as: 'agency' });
    }

    static createOrUpdate(user, agency, data, options) {
      return Base.createOrUpdate(Response, user, agency, data, [], ['agencyId', 'data'], options);
    }

    toJSON() {
      const attributes = { ...this.get() };
      return _.pick(attributes, [
        'id',
        'canonicalId',
        'currentId',
        'parentId',
        'secondParentId',
        'agencyId',
        'data',
        'updatedAttributes',
        'updatedDataAttributes',
        'isValid',
        'validationErrors',
        'createdAt',
        'createdById',
        'createdByAgencyId',
        'updatedAt',
        'updatedById',
        'updatedByAgencyId',
      ]);
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
    },
  );

  Response.beforeValidate(async (record, options) => {
    const { transaction } = options ?? {};
    const agency =
      record.agency ||
      (await record.getAgency({ transaction })) ||
      record.createdByAgency ||
      (await record.getCreatedByAgency({ transaction }));
    if (agency) {
      record.setNemsisValue(['eResponse.AgencyGroup', 'eResponse.01'], agency.stateUniqueId);
      record.setNemsisValue(['eResponse.AgencyGroup', 'eResponse.02'], agency.name);
    }
    record.setDefaultNemsisValue(['eResponse.03'], null);
    record.setDefaultNemsisValue(['eResponse.04'], null);
    record.setDefaultNemsisValue(['eResponse.14'], record.getFirstNemsisValue(['eResponse.13']));
  });

  return Response;
};
