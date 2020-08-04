'use strict';

const sequelizePaginate = require('sequelize-paginate')
const nemsis = require('../../lib/nemsis');

module.exports = (sequelize, DataTypes) => {
  const Contact = sequelize.define('Contact', {
    type: DataTypes.STRING,
    lastName: {
      type: DataTypes.STRING,
      field: 'last_name'
    },
    firstName: {
      type: DataTypes.STRING,
      field: 'first_name'
    },
    middleName: {
      type: DataTypes.STRING,
      field: 'middle_name'
    },
    primaryPhone: {
      type: DataTypes.STRING,
      field: 'primary_phone'
    },
    primaryEmail: {
      type: DataTypes.STRING,
      field: 'primary_email'
    },
    data: DataTypes.JSONB,
    isValid: {
      type: DataTypes.BOOLEAN,
      field: 'is_valid'
    }
  }, {
    schema: 'demographics',
    tableName: 'contacts',
    underscored: true,
    validate: {
      schema: async function() {
        this.validationError = await nemsis.validateSchema('dContact_v3.xsd', 'dContact', 'dContact.ContactInfoGroup', this.data);
        if (this.validationError) throw this.validationError;
      }
    }
  });
  Contact.associate = function(models) {
    Contact.belongsTo(models.DemAgency, {as: 'agency'});
    Contact.belongsTo(models.User, {as: 'updatedBy'});
    Contact.belongsTo(models.User, {as: 'createdBy'});

    Contact.beforeSave(async function(record, options) {
      if (!record.id) {
        record.setDataValue('id', record.data?._attributes?.UUID);
      }
      record.setDataValue('type', record.data?.['dContact.01']?._text);
      record.setDataValue('lastName', record.data?.['dContact.02']?._text);
      record.setDataValue('firstName', record.data?.['dContact.03']?._text);
      record.setDataValue('middleName', record.data?.['dContact.04']?._text);
      record.setDataValue('primaryPhone', models.helpers.data.firstValueOf(record.data?.['dContact.10']));
      record.setDataValue('primaryEmail', models.helpers.data.firstValueOf(record.data?.['dContact.11']));
      record.setDataValue('isValid', record.data?._attributes?.['pr:isValid']);
    });
  };
  sequelizePaginate.paginate(Contact)
  return Contact;
};
