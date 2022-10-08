const _ = require('lodash');
const sequelizePaginate = require('sequelize-paginate');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Form extends Base {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Form.belongsTo(Form, { as: 'canonical' });
      Form.belongsTo(Form, { as: 'current' });
      Form.belongsTo(Form, { as: 'parent' });
      Form.belongsTo(Form, { as: 'secondParent' });
      Form.belongsTo(models.User, { as: 'updatedBy' });
      Form.belongsTo(models.User, { as: 'createdBy' });
      Form.belongsTo(models.Agency, { as: 'createdByAgency' });
    }

    static createOrUpdate(user, agency, data, options) {
      return Base.createOrUpdate(Form, user, agency, data, [], ['title', 'body', 'reasons', 'signatures', 'archivedAt'], options);
    }

    toJSON() {
      const attributes = { ...this.get() };
      return _.pick(attributes, [
        'id',
        'canonicalId',
        'currentId',
        'parentId',
        'secondParentId',
        'updatedAttributes',
        'title',
        'body',
        'reasons',
        'signatures',
        'archivedAt',
        'createdAt',
        'createdById',
        'createdByAgencyId',
        'updatedAt',
        'updatedById',
      ]);
    }
  }
  Form.init(
    {
      title: DataTypes.STRING,
      body: DataTypes.TEXT,
      reasons: DataTypes.JSONB,
      signatures: DataTypes.JSONB,
      archivedAt: {
        type: DataTypes.DATE,
        field: 'archived_at',
      },
      updatedAttributes: {
        type: DataTypes.JSONB,
        field: 'updated_attributes',
      },
    },
    {
      sequelize,
      modelName: 'Form',
      tableName: 'forms',
      underscored: true,
    }
  );

  Form.addScope('canonical', {
    where: {
      canonicalId: null,
    },
  });

  sequelizePaginate.paginate(Form);

  return Form;
};
