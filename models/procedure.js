const _ = require('lodash');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Procedure extends Base {
    static get xsdPath() {
      return 'eProcedures_v3.xsd';
    }

    static get rootTag() {
      return 'eProcedures';
    }

    static get groupTag() {
      return 'eProcedures.ProcedureGroup';
    }

    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Procedure.belongsTo(Procedure, { as: 'canonical' });
      Procedure.belongsTo(Procedure, { as: 'current' });
      Procedure.belongsTo(Procedure, { as: 'parent' });
      Procedure.belongsTo(Procedure, { as: 'secondParent' });
      Procedure.belongsTo(models.User, { as: 'createdBy' });
      Procedure.belongsTo(models.User, { as: 'updatedBy' });
      Procedure.belongsTo(models.Agency, { as: 'createdByAgency' });
      Procedure.belongsTo(models.Agency, { as: 'updatedByAgency' });
    }

    static createOrUpdate(user, agency, data, options) {
      return Base.createOrUpdate(Procedure, user, agency, data, [], ['data'], options);
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

  Procedure.init(
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
      modelName: 'Procedure',
      tableName: 'procedures',
      underscored: true,
    }
  );

  return Procedure;
};
