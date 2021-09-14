const _ = require('lodash');
const sequelizePaginate = require('sequelize-paginate');
const url = require('url');
const uuid = require('uuid');

const { Base } = require('./base');
const nemsis = require('../lib/nemsis');

module.exports = (sequelize, DataTypes) => {
  class Agency extends Base {
    get isClaimed() {
      return this.createdByAgencyId === this.id;
    }

    static associate(models) {
      Agency.belongsTo(models.Agency, { as: 'canonicalAgency' });
      Agency.belongsTo(models.Agency, { as: 'createdByAgency' });
      Agency.belongsTo(models.State, { as: 'state' });
      Agency.belongsTo(models.User, { as: 'updatedBy' });
      Agency.belongsTo(models.User, { as: 'createdBy' });

      Agency.hasMany(models.Agency, {
        as: 'customizedAgencies',
        foreignKey: 'createdByAgencyId',
      });
      Agency.hasMany(models.Contact, {
        as: 'contacts',
        foreignKey: 'createdByAgencyId',
      });
      Agency.hasMany(models.Employment, { as: 'employments', foreignKey: 'agencyId' });
      Agency.hasMany(models.Patient, {
        as: 'patients',
        foreignKey: 'transportAgencyId',
      });
      Agency.hasMany(models.Scene, {
        as: 'scenes',
        foreignKey: 'createdByAgencyId',
      });
      Agency.hasMany(models.Scene.scope('canonical', 'active'), {
        as: 'activeScenes',
        foreignKey: 'createdByAgencyId',
      });
      Agency.hasMany(models.Vehicle, {
        as: 'vehicles',
        foreignKey: 'createdByAgencyId',
      });
      Agency.belongsToMany(models.User, {
        as: 'users',
        through: models.Employment,
        otherKey: 'userId',
        foreignKey: 'agencyId',
      });
      Agency.belongsToMany(models.User, {
        as: 'activeUsers',
        through: models.Employment.scope('active'),
        otherKey: 'userId',
        foreignKey: 'agencyId',
      });
      Agency.belongsToMany(models.User, {
        as: 'activePersonnelAdminUsers',
        through: models.Employment.scope({ method: ['role', models.Employment.Roles.PERSONNEL] }, 'active'),
        otherKey: 'userId',
        foreignKey: 'agencyId',
      });
    }

    static async register(user, canonicalAgency, subdomain, options) {
      /// create the Demographic Agency record clone
      const id = uuid.v4();
      const data = {
        id,
        canonicalAgencyId: canonicalAgency.id,
        stateUniqueId: canonicalAgency.stateUniqueId,
        number: canonicalAgency.number,
        stateId: canonicalAgency.stateId,
        name: canonicalAgency.name,
        subdomain,
        createdByAgencyId: id,
        createdById: user.id,
        updatedById: user.id,
        data: JSON.parse(JSON.stringify(canonicalAgency.data).replace(/"sAgency\.(0\d)"/g, '"dAgency.$1"')),
      };
      data.data._attributes = { UUID: id };
      data.data['dAgency.04'] = { _text: canonicalAgency.stateId };
      const agency = await sequelize.models.Agency.create(data, options);
      /// associate User to Demographic as owner
      const now = new Date();
      await sequelize.models.Employment.create(
        {
          agencyId: agency.id,
          userId: user.id,
          hiredAt: now,
          startedAt: now,
          isOwner: true,
          createdById: user.id,
          updatedById: user.id,
        },
        options
      );
      /// done!
      return agency;
    }

    async generateSubdomain() {
      /// count the number of words
      const tokens = this.name.replace(/[^\w ]|_/g, '').split(/\s+/);
      /// either use the full name or an acronym of first letters depending on number of words
      const name = tokens.length < 4 ? this.name : tokens.map((t) => t.charAt(0)).join('');
      /// remove whitespace/symbols to generate subdomain
      let subdomain = name.toLowerCase().replace(/[^\w]|_/g, '');
      let index = 1;
      // eslint-disable-next-line no-await-in-loop
      while (await Agency.findOne({ where: { subdomain } })) {
        /// add numeric index until unique subdomain found
        subdomain = `${name.toLowerCase().replace(/[^\w]|_/g, '')}${index}`;
        index += 1;
      }
      return subdomain;
    }

    getLocalizedInvitationMessage(i18n) {
      return i18n.__('models.agency.invitationMessage', { name: this.name });
    }

    toJSON() {
      const attributes = { ...this.get() };
      return _.pick(attributes, [
        'id',
        'canonicalAgencyId',
        'stateId',
        'subdomain',
        'baseUrl',
        'stateUniqueId',
        'number',
        'name',
        'isValid',
        'createdAt',
        'createdById',
        'createdByAgencyId',
        'updatedAt',
        'updatedById',
      ]);
    }

    toPublicJSON() {
      const attributes = { ...this.get() };
      return _.pick(attributes, ['id', 'stateId', 'stateUniqueId', 'number', 'name']);
    }
  }

  Agency.init(
    {
      subdomain: {
        type: DataTypes.STRING,
        validate: {
          is: /^[\w-]+$/i,
        },
      },
      baseUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          const baseUrl = url.parse(process.env.BASE_URL);
          return `${baseUrl.protocol}//${this.subdomain}.${baseUrl.host}`;
        },
      },
      stateUniqueId: {
        type: DataTypes.STRING,
        field: 'state_unique_id',
      },
      number: DataTypes.STRING,
      name: DataTypes.STRING,
      data: DataTypes.JSONB,
      isValid: {
        type: DataTypes.BOOLEAN,
        field: 'is_valid',
      },
    },
    {
      sequelize,
      modelName: 'Agency',
      tableName: 'agencies',
      underscored: true,
      validate: {
        async schema() {
          if (this.isClaimed) {
            this.validationError = await nemsis.validateSchema('dAgency_v3.xsd', 'dAgency', null, this.data);
            this.isValid = this.validationError === null;
          }
        },
      },
    }
  );

  Agency.addScope('canonical', {
    where: { createdByAgencyId: null },
  });

  Agency.addScope('claimed', {
    where: { createdByAgencyId: { [sequelize.Sequelize.Op.col]: 'id' } },
  });

  Agency.beforeSave(async (record) => {
    if (!record.id) {
      let id = record.getNemsisAttributeValue([], 'UUID');
      if (!id) {
        id = uuid.v4();
      }
      record.setDataValue('id', id);
    }
    if (record.isClaimed) {
      record.setDataValue('stateUniqueId', record.getFirstNemsisValue(['dAgency.01']));
      record.setDataValue('number', record.getFirstNemsisValue(['dAgency.02']));
      record.setDataValue('name', record.getFirstNemsisValue(['dAgency.03']));
    }
  });

  sequelizePaginate.paginate(Agency);

  return Agency;
};
