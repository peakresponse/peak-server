const sequelizePaginate = require('sequelize-paginate');
const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Contact extends Base {
    static associate(models) {
      Contact.belongsTo(models.User, { as: 'updatedBy' });
      Contact.belongsTo(models.User, { as: 'createdBy' });
      Contact.belongsTo(models.Agency, { as: 'createdByAgency' });
    }
  }

  Contact.init(
    {
      type: DataTypes.STRING,
      lastName: {
        type: DataTypes.STRING,
        field: 'last_name',
      },
      firstName: {
        type: DataTypes.STRING,
        field: 'first_name',
      },
      middleName: {
        type: DataTypes.STRING,
        field: 'middle_name',
      },
      primaryPhone: {
        type: DataTypes.STRING,
        field: 'primary_phone',
      },
      primaryEmail: {
        type: DataTypes.STRING,
        field: 'primary_email',
      },
      data: DataTypes.JSONB,
      isValid: {
        type: DataTypes.BOOLEAN,
        field: 'is_valid',
      },
    },
    {
      sequelize,
      modelName: 'Contact',
      tableName: 'contacts',
      underscored: true,
    }
  );

  Contact.beforeValidate(async (record, options) => {
    record.syncNemsisId(options);
    record.syncFieldAndNemsisValue('type', ['dContact.01'], options);
    record.syncFieldAndNemsisValue('lastName', ['dContact.02'], options);
    record.syncFieldAndNemsisValue('firstName', ['dContact.03'], options);
    record.syncFieldAndNemsisValue('middleName', ['dContact.04'], options);
    record.syncFieldAndNemsisValue('primaryPhone', ['dContact.10'], options);
    record.syncFieldAndNemsisValue('primaryEmail', ['dContact.11'], options);
    await record.validateNemsisData('dContact_v3.xsd', 'dContact', 'dContact.ContactInfoGroup', options);
  });

  sequelizePaginate.paginate(Contact);

  return Contact;
};
