const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Narrative extends Base {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Narrative.belongsTo(models.Version, { as: 'version' });
      Narrative.belongsTo(Narrative, { as: 'canonical' });
      Narrative.belongsTo(Narrative, { as: 'current' });
      Narrative.belongsTo(Narrative, { as: 'parent' });
      Narrative.belongsTo(Narrative, { as: 'secondParent' });
      Narrative.belongsTo(models.User, { as: 'createdBy' });
      Narrative.belongsTo(models.User, { as: 'updatedBy' });
      Narrative.belongsTo(models.Agency, { as: 'createdByAgency' });
      Narrative.belongsTo(models.Agency, { as: 'updatedByAgency' });
    }

    static createOrUpdate(user, agency, data, options) {
      return Base.createOrUpdate(Narrative, user, agency, data, [], ['data'], options);
    }
  }

  Narrative.init(
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
      },
    },
    {
      sequelize,
      modelName: 'Narrative',
      tableName: 'narratives',
      underscored: true,
    }
  );

  Narrative.beforeSave(async (record, options) => {
    await record.validateNemsisData('eNarrative_v3.xsd', 'eNarrative', null, options);
  });

  return Narrative;
};
