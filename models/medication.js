const _ = require('lodash');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Medication extends Base {
    static get xsdPath() {
      return 'eMedications_v3.xsd';
    }

    static get rootTag() {
      return 'eMedications';
    }

    static get groupTag() {
      return 'eMedications.MedicationGroup';
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Medication.belongsTo(Medication, { as: 'canonical' });
      Medication.belongsTo(Medication, { as: 'current' });
      Medication.belongsTo(Medication, { as: 'parent' });
      Medication.belongsTo(Medication, { as: 'secondParent' });
      Medication.belongsTo(models.User, { as: 'createdBy' });
      Medication.belongsTo(models.User, { as: 'updatedBy' });
      Medication.belongsTo(models.Agency, { as: 'createdByAgency' });
      Medication.belongsTo(models.Agency, { as: 'updatedByAgency' });
    }

    static createOrUpdate(user, agency, data, options) {
      return Base.createOrUpdate(Medication, user, agency, data, [], ['data'], options);
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

  Medication.init(
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
      modelName: 'Medication',
      tableName: 'medications',
      underscored: true,
    },
  );

  Medication.beforeValidate(async (record) => {
    record.setDefaultNemsisValue(['eMedications.01'], null);
    record.setDefaultNemsisValue(['eMedications.02'], null);
    record.setDefaultNemsisValue(['eMedications.03'], null);
    record.setDefaultNemsisValue(['eMedications.04'], null);
    record.setDefaultNemsisValue(['eMedications.DosageGroup', 'eMedications.05'], null);
    record.setDefaultNemsisValue(['eMedications.DosageGroup', 'eMedications.06'], null);
    record.setDefaultNemsisValue(['eMedications.07'], null);
    record.setDefaultNemsisValue(['eMedications.08'], null);
    record.setDefaultNemsisValue(['eMedications.10'], null);
  });

  return Medication;
};
