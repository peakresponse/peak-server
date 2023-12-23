const _ = require('lodash');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Vital extends Base {
    static get xsdPath() {
      return 'eVitals_v3.xsd';
    }

    static get rootTag() {
      return 'eVitals';
    }

    static get groupTag() {
      return 'eVitals.VitalGroup';
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Vital.belongsTo(Vital, { as: 'canonical' });
      Vital.belongsTo(Vital, { as: 'current' });
      Vital.belongsTo(Vital, { as: 'parent' });
      Vital.belongsTo(Vital, { as: 'secondParent' });
      Vital.belongsTo(models.User, { as: 'createdBy' });
      Vital.belongsTo(models.User, { as: 'updatedBy' });
      Vital.belongsTo(models.Agency, { as: 'createdByAgency' });
      Vital.belongsTo(models.Agency, { as: 'updatedByAgency' });
    }

    static createOrUpdate(user, agency, data, options) {
      return Base.createOrUpdate(Vital, user, agency, data, [], ['data'], options);
    }

    toJSON() {
      const attributes = { ...this.get() };
      return _.pick(attributes, [
        'id',
        'canonicalId',
        'currentId',
        'parentId',
        'secondParentId',
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

  Vital.init(
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
      modelName: 'Vital',
      tableName: 'vitals',
      underscored: true,
    },
  );

  return Vital;
};
