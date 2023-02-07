const _ = require('lodash');
const sequelizePaginate = require('sequelize-paginate');
const url = require('url');
const uuid = require('uuid');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Agency extends Base {
    static associate(models) {
      Agency.belongsTo(models.Agency, { as: 'canonicalAgency' });
      Agency.hasOne(models.Agency.scope('includeClaimed'), { as: 'claimedAgency', foreignKey: 'canonicalAgencyId' });
      Agency.belongsTo(models.Agency, { as: 'draftParent' });
      Agency.hasOne(models.Agency, { as: 'draft', foreignKey: 'draftParentId' });
      Agency.belongsTo(models.Agency, { as: 'createdByAgency' });
      Agency.belongsTo(models.State, { as: 'state' });
      Agency.belongsTo(models.User, { as: 'updatedBy' });
      Agency.belongsTo(models.User, { as: 'createdBy' });
      Agency.belongsTo(models.Psap, { as: 'psap' });
      Agency.hasMany(models.Agency, {
        as: 'customizedAgencies',
        foreignKey: 'createdByAgencyId',
      });
      Agency.hasMany(models.Contact, {
        as: 'contacts',
        foreignKey: 'createdByAgencyId',
      });
      Agency.hasMany(models.Employment, { as: 'employments', foreignKey: 'agencyId' });
      Agency.hasMany(models.Form.scope('canonical'), {
        as: 'forms',
        foreignKey: 'createdByAgencyId',
      });
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
      data.data['dAgency.04'] = { _text: canonicalAgency.stateId };
      const agency = await sequelize.models.Agency.create(data, { transaction: options?.transaction });
      /// associate User to Demographic as owner
      const now = new Date();
      const employment = sequelize.models.Employment.build({
        agencyId: agency.id,
        hiredOn: now,
        startedOn: now,
        isOwner: true,
        createdById: user.id,
        updatedById: user.id,
      });
      employment.setUser(user);
      await employment.save({ transaction: options?.transaction });
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
        'claimedAgency',
        'stateId',
        'isClaimed',
        'subdomain',
        'baseUrl',
        'routedUrl',
        'psapId',
        'stateUniqueId',
        'number',
        'name',
        'isDraft',
        'isValid',
        'validationErrors',
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
      isClaimed: {
        type: DataTypes.VIRTUAL(DataTypes.BOOLEAN, ['id', 'createdByAgencyId', 'isDraft']),
        get() {
          return this.isDraft || this.createdByAgencyId === this.id;
        },
      },
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
          return this.subdomain ? `${baseUrl.protocol}//${this.subdomain}.${baseUrl.host}` : null;
        },
      },
      routedUrl: {
        type: DataTypes.STRING(2048),
        field: 'routed_url',
      },
      stateId: {
        type: DataTypes.STRING,
        field: 'state_id',
      },
      stateUniqueId: {
        allowNull: false,
        type: DataTypes.STRING,
        field: 'state_unique_id',
      },
      number: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      name: {
        type: DataTypes.STRING,
      },
      data: {
        type: DataTypes.JSONB,
      },
      isDraft: {
        type: DataTypes.BOOLEAN,
        field: 'is_draft',
      },
      isValid: {
        type: DataTypes.BOOLEAN,
        field: 'is_valid',
      },
      validationErrors: {
        type: DataTypes.JSONB,
      },
    },
    {
      sequelize,
      modelName: 'Agency',
      tableName: 'agencies',
      underscored: true,
    }
  );

  Agency.addScope('canonical', {
    where: { createdByAgencyId: null },
  });

  Agency.addScope('claimed', {
    where: { createdByAgencyId: { [sequelize.Sequelize.Op.col]: 'id' } },
  });

  Agency.addScope('includeClaimed', {
    where: { createdByAgencyId: { [sequelize.Sequelize.Op.col]: 'claimedAgency.id' } },
  });

  Agency.beforeValidate(async (record, options) => {
    const prefix = record.isClaimed || record.isDraft ? 'dAgency' : 'sAgency';
    record.syncFieldAndNemsisValue('stateUniqueId', [`${prefix}.01`], options);
    record.syncFieldAndNemsisValue('number', [`${prefix}.02`], options);
    record.syncFieldAndNemsisValue('name', [`${prefix}.03`], options);
    if (record.isClaimed || record.isDraft) {
      record.syncFieldAndNemsisValue('stateId', [`${prefix}.04`], options);
      await record.validateNemsisData('dAgency_v3.xsd', 'dAgency', null, options);
    }
  });

  sequelizePaginate.paginate(Agency);

  return Agency;
};
