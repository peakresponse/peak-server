const _ = require('lodash');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Disposition extends Base {
    static get xsdPath() {
      return 'eDisposition_v3.xsd';
    }

    static get rootTag() {
      return 'eDisposition';
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Disposition.belongsTo(Disposition, { as: 'canonical' });
      Disposition.belongsTo(Disposition, { as: 'current' });
      Disposition.belongsTo(Disposition, { as: 'parent' });
      Disposition.belongsTo(Disposition, { as: 'secondParent' });
      Disposition.belongsTo(models.User, { as: 'createdBy' });
      Disposition.belongsTo(models.User, { as: 'updatedBy' });
      Disposition.belongsTo(models.Agency, { as: 'createdByAgency' });
      Disposition.belongsTo(models.Agency, { as: 'updatedByAgency' });

      Disposition.belongsTo(models.Facility, { as: 'destinationFacility' });
    }

    static createOrUpdate(user, agency, data, options) {
      return Base.createOrUpdate(Disposition, user, agency, data, [], ['destinationFacilityId', 'data'], options);
    }

    toJSON() {
      const attributes = { ...this.get() };
      return _.pick(attributes, [
        'id',
        'canonicalId',
        'currentId',
        'parentId',
        'secondParentId',
        'destinationFacilityId',
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

  Disposition.init(
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
      modelName: 'Disposition',
      tableName: 'dispositions',
      underscored: true,
    },
  );

  return Disposition;
};
