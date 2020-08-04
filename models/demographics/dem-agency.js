'use strict';

const url = require('url');

const nemsis = require('../../lib/nemsis');
const {NemsisModel} = require('../nemsis-model');

module.exports = (sequelize, DataTypes) => {
  class DemAgency extends NemsisModel {
    static associate(models) {
      DemAgency.belongsTo(models.Agency, {as: 'agency'});
      DemAgency.belongsTo(models.State, {as: 'state'});
      DemAgency.belongsTo(models.User, {as: 'updatedBy'});
      DemAgency.belongsTo(models.User, {as: 'createdBy'});
      DemAgency.hasMany(models.Contact, {as: 'contacts', foreignKey: 'agencyId'});
    }

    static async register(user, sAgency, subdomain, options) {
      options = {transaction: options ? options.transaction : null};
      /// create the Demographic Agency record clone
      const agencyData = sAgency.toJSON();
      agencyData.agencyId = agencyData.id;
      delete agencyData.id;
      agencyData.subdomain = subdomain;
      agencyData.createdById = user.id;
      agencyData.updatedById = user.id;
      agencyData.data = JSON.parse(JSON.stringify(sAgency.data).replace(/"sAgency\.(0\d)"/g, '"dAgency.$1"'));
      agencyData.data['dAgency.04'] = {_text: sAgency.stateId};
      const agency = await sequelize.models.DemAgency.create(agencyData, options);
      /// associate User to Demographic as owner
      const now = new Date();
      await sequelize.models.Employment.create({
        agencyId: agency.id,
        userId: user.id,
        hiredAt: now,
        startedAt: now,
        isOwner: true,
        createdById: user.id,
        updatedById: user.id
      }, options);
      /// done!
      return agency;
    }

    toJSON() {
      let attributes = Object.assign({}, this.get());
      /// by default, don't return the large attributes
      delete attributes.data;
      return attributes;
    };

    getLocalizedInvitationMessage(i18n) {
      return i18n.__('models.demographics.agency.invitationMessage', {name: this.name});
    }
  };

  DemAgency.init({
    subdomain: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^[\w-]+$/i
      }
    },
    baseUrl: {
      type: DataTypes.VIRTUAL,
      get() {
        const baseUrl = url.parse(process.env.BASE_URL);
        return `${baseUrl.protocol}//${this.subdomain}.${baseUrl.host}`;
      },
      set(value) {
        throw new Error('Do not try to set the `baseUrl` value!');
      }
    },
    stateUniqueId: {
      type: DataTypes.STRING,
      field: 'state_unique_id'
    },
    number: DataTypes.STRING,
    name: DataTypes.STRING,
    data: DataTypes.JSONB,
    isValid: {
      type: DataTypes.BOOLEAN,
      field: 'is_valid'
    }
  }, {
    sequelize,
    modelName: 'DemAgency',
    schema: 'demographics',
    tableName: 'agencies',
    underscored: true,
    validate: {
      schema: async function() {
        this.validationError = await nemsis.validateSchema('dAgency_v3.xsd', 'dAgency', null, this.data);
      }
    }
  });

  DemAgency.beforeSave(async function(record, options) {
    record.setDataValue('stateUniqueId', record.getFirstNemsisValue(['dAgency.01']));
    record.setDataValue('number', record.getFirstNemsisValue(['dAgency.02']));
    record.setDataValue('name', record.getFirstNemsisValue(['dAgency.03']));
    record.setDataValue('isValid', record.getNemsisAttributeValue([], ['pr:isValid']));
  });

  return DemAgency;
};
