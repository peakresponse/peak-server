const { Base } = require('./base');
const nemsis = require('../lib/nemsis');

module.exports = (sequelize, DataTypes) => {
  class Time extends Base {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Time.belongsTo(Time, { as: 'canonical' });
      Time.belongsTo(Time, { as: 'current' });
      Time.belongsTo(Time, { as: 'parent' });
      Time.belongsTo(Time, { as: 'secondParent' });
      Time.belongsTo(models.User, { as: 'createdBy' });
      Time.belongsTo(models.User, { as: 'updatedBy' });
      Time.belongsTo(models.Agency, { as: 'createdByAgency' });
      Time.belongsTo(models.Agency, { as: 'updatedByAgency' });
    }

    static createOrUpdate(user, agency, data, options) {
      return Base.createOrUpdate(Time, user, agency, data, [], ['data'], options);
    }
  }
  Time.init(
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
      modelName: 'Time',
      tableName: 'times',
      underscored: true,
      validate: {
        async schema() {
          this.validationErrors = await nemsis.validateSchema('eTimes_v3.xsd', 'eTimes', null, this.data);
          this.isValid = this.validationErrors === null;
        },
      },
    }
  );
  return Time;
};
