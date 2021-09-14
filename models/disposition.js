const { Base } = require('./base');
const nemsis = require('../lib/nemsis');

module.exports = (sequelize, DataTypes) => {
  class Disposition extends Base {
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
    }

    static createOrUpdate(user, agency, data, options) {
      return Base.createOrUpdate(Disposition, user, agency, data, [], ['data'], options);
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
      validate: {
        async schema() {
          this.validationErrors = await nemsis.validateSchema('eDisposition_v3.xsd', 'eDisposition', null, this.data);
          this.isValid = this.validationErrors === null;
        },
      },
    }
  );
  return Disposition;
};
