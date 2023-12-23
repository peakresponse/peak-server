const sequelizePaginate = require('sequelize-paginate');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Contact extends Base {
    static get xsdPath() {
      return 'dContact_v3.xsd';
    }

    static get rootTag() {
      return 'dContact';
    }

    static get groupTag() {
      return 'dContact.ContactInfoGroup';
    }

    static associate(models) {
      Contact.belongsTo(Contact, { as: 'draftParent' });
      Contact.hasOne(Contact, { as: 'draft', foreignKey: 'draftParentId' });
      Contact.belongsTo(models.User, { as: 'updatedBy' });
      Contact.belongsTo(models.User, { as: 'createdBy' });
      Contact.belongsTo(models.Agency, { as: 'createdByAgency' });
      Contact.belongsTo(models.Version, { as: 'version' });
    }
  }

  Contact.init(
    {
      isDraft: {
        type: DataTypes.BOOLEAN,
      },
      type: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      firstName: {
        type: DataTypes.STRING,
      },
      middleName: {
        type: DataTypes.STRING,
      },
      primaryPhone: {
        type: DataTypes.STRING,
      },
      primaryEmail: {
        type: DataTypes.STRING,
      },
      data: {
        type: DataTypes.JSONB,
      },
      isValid: {
        type: DataTypes.BOOLEAN,
      },
      validationErrors: {
        type: DataTypes.JSONB,
      },
      archivedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: 'Contact',
      tableName: 'contacts',
      underscored: true,
    },
  );

  Contact.addDraftScopes();

  Contact.beforeValidate(async (record, options) => {
    record.syncNemsisId(options);
    record.syncFieldAndNemsisValue('type', ['dContact.01'], options);
    record.syncFieldAndNemsisValue('lastName', ['dContact.02'], options);
    record.syncFieldAndNemsisValue('firstName', ['dContact.03'], options);
    record.syncFieldAndNemsisValue('middleName', ['dContact.04'], options);
    record.syncFieldAndNemsisValue('primaryPhone', ['dContact.10'], options);
    record.syncFieldAndNemsisValue('primaryEmail', ['dContact.11'], options);
    await record.xsdValidate(options);
  });

  sequelizePaginate.paginate(Contact);

  return Contact;
};
