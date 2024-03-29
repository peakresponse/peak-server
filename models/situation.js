const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Situation extends Base {
    static get xsdPath() {
      return 'eSituation_v3.xsd';
    }

    static get rootTag() {
      return 'eSituation';
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Situation.belongsTo(Situation, { as: 'canonical' });
      Situation.belongsTo(Situation, { as: 'current' });
      Situation.belongsTo(Situation, { as: 'parent' });
      Situation.belongsTo(Situation, { as: 'secondParent' });
      Situation.belongsTo(models.User, { as: 'createdBy' });
      Situation.belongsTo(models.User, { as: 'updatedBy' });
      Situation.belongsTo(models.Agency, { as: 'createdByAgency' });
      Situation.belongsTo(models.Agency, { as: 'updatedByAgency' });
    }

    static createOrUpdate(user, agency, data, options) {
      return Base.createOrUpdate(Situation, user, agency, data, [], ['data'], options);
    }
  }
  Situation.init(
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
      modelName: 'Situation',
      tableName: 'situations',
      underscored: true,
    },
  );

  return Situation;
};
