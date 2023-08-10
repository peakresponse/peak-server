const _ = require('lodash');
const { Op } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
const url = require('url');
const { v4: uuidv4 } = require('uuid');

const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class Agency extends Base {
    static get xsdPath() {
      return 'dAgency_v3.xsd';
    }

    static get rootTag() {
      return 'dAgency';
    }

    static associate(models) {
      Agency.belongsTo(models.Agency, { as: 'canonicalAgency' });
      Agency.hasOne(models.Agency.scope('includeClaimed'), { as: 'claimedAgency', foreignKey: 'canonicalAgencyId' });
      Agency.belongsTo(models.Agency, { as: 'draftParent' });
      Agency.hasOne(models.Agency, { as: 'draft', foreignKey: 'draftParentId' });
      Agency.belongsTo(models.Agency, { as: 'createdByAgency' });
      Agency.belongsTo(models.NemsisStateDataSet, { as: 'stateDataSet' });
      Agency.belongsTo(models.State, { as: 'state' });
      Agency.belongsTo(models.User, { as: 'updatedBy' });
      Agency.belongsTo(models.User, { as: 'createdBy' });
      Agency.belongsTo(models.Psap, { as: 'psap' });
      Agency.belongsTo(models.Version, { as: 'version' });
      Agency.hasMany(models.Version, { as: 'versions', foreignKey: 'agencyId' });
      Agency.hasMany(models.Agency, {
        as: 'customizedAgencies',
        foreignKey: 'createdByAgencyId',
      });
      Agency.hasMany(models.Contact, {
        as: 'contacts',
        foreignKey: 'createdByAgencyId',
      });
      Agency.hasMany(models.Employment.scope('finalOrNew'), { as: 'employments', foreignKey: 'createdByAgencyId' });
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
        through: models.Employment.scope('finalOrNew'),
        otherKey: 'userId',
        foreignKey: 'createdByAgencyId',
      });
      Agency.belongsToMany(models.User, {
        as: 'activeUsers',
        through: models.Employment.scope('finalOrNew', 'active'),
        otherKey: 'userId',
        foreignKey: 'createdByAgencyId',
      });
      Agency.belongsToMany(models.User, {
        as: 'activePersonnelAdminUsers',
        through: models.Employment.scope('finalOrNew', { method: ['role', models.Employment.Roles.PERSONNEL] }, 'active'),
        otherKey: 'userId',
        foreignKey: 'createdByAgencyId',
      });
    }

    static async register(user, canonicalAgency, subdomain, options) {
      const { transaction } = options ?? {};
      // create the Demographic Agency record clone
      const id = uuidv4();
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
        nemsisVersion: canonicalAgency.nemsisVersion,
        stateDataSetId: canonicalAgency.stateDataSetId,
        data: JSON.parse(JSON.stringify(canonicalAgency.data).replace(/"sAgency\.(0\d)"/g, '"dAgency.$1"')),
      };
      data.data['dAgency.04'] = { _text: canonicalAgency.stateId };
      const agency = await sequelize.models.Agency.create(data, { transaction });
      // get the latest Schematrons for the state
      const demSchematron = await sequelize.models.NemsisSchematron.findOne({
        where: {
          dataSet: 'DEMDataSet',
          stateId: canonicalAgency.stateId,
          version: {
            [Op.not]: null,
          },
        },
        order: [['version', 'DESC']],
        transaction,
      });
      const emsSchematron = await sequelize.models.NemsisSchematron.findOne({
        where: {
          dataSet: 'EMSDataSet',
          stateId: canonicalAgency.stateId,
          version: {
            [Op.not]: null,
          },
        },
        order: [['version', 'DESC']],
        transaction,
      });
      // create a first Version for the Agency
      const version = await sequelize.models.Version.create(
        {
          agencyId: agency.id,
          isDraft: false,
          nemsisVersion: agency.nemsisVersion,
          stateDataSetId: agency.stateDataSetId,
          demSchematronIds: demSchematron ? [demSchematron.id] : [],
          emsSchematronIds: emsSchematron ? [emsSchematron.id] : [],
          createdById: user.id,
          updatedById: user.id,
        },
        { transaction }
      );
      await version.regenerate({ transaction });
      await agency.update({ versionId: version.id }, { transaction });
      // associate User to Demographic as owner
      const now = new Date();
      const employment = sequelize.models.Employment.build({
        createdByAgencyId: agency.id,
        hiredOn: now,
        startedOn: now,
        isOwner: true,
        createdById: user.id,
        updatedById: user.id,
      });
      employment.setUser(user);
      await employment.save({ transaction });
      // done!
      return agency;
    }

    async getDraftVersion(options) {
      const versions = await this.getVersions({
        include: ['stateDataSet'],
        where: {
          isDraft: true,
        },
        transaction: options?.transaction,
      });
      return versions.length > 0 ? versions[0] : null;
    }

    async getOrCreateDraftVersion(user, options) {
      let version = await this.getDraftVersion(options);
      if (!version) {
        // clone current version to start
        version = await this.getVersion({ transaction: options?.transaction });
        version = await sequelize.models.Version.create(
          {
            ..._.pick(version, [
              'nemsisVersion',
              'stateDataSetId',
              'demSchematronIds',
              'emsSchematronIds',
              'demCustomConfiguration',
              'emsCustomConfiguration',
              'demDataSet',
              'isValid',
              'validationErrors',
            ]),
            agencyId: this.id,
            isDraft: true,
            createdById: user.id,
            updatedById: user.id,
          },
          { transaction: options?.transaction }
        );
      }
      return version;
    }

    async importConfiguration(user, options) {
      if (!options?.transaction) {
        return sequelize.transaction((transaction) => this.importConfiguration(user, { ...options, transaction }));
      }
      const { transaction } = options;
      const version = await this.getOrCreateDraftVersion(user, { transaction });
      const stateDataSet = await version.getStateDataSet({ transaction });
      let record;
      await stateDataSet.parseConfiguration(async (dataSetNemsisVersion, configuration) => {
        record = await sequelize.models.Configuration.scope('finalOrNew').findOne({
          where: {
            createdByAgencyId: this.id,
            stateId: this.stateId,
          },
          include: ['draft'],
          transaction,
        });
        const data = record ? _.cloneDeep(record.draft ? record.draft.data : record.data) : {};
        const scpgs = Array.isArray(configuration['sConfiguration.ProcedureGroup'])
          ? configuration['sConfiguration.ProcedureGroup']
          : [configuration['sConfiguration.ProcedureGroup']];
        data['dConfiguration.ProcedureGroup'] = scpgs.map((scpg) => ({
          _attributes: { UUID: uuidv4() },
          'dConfiguration.06': scpg['sConfiguration.02'],
          'dConfiguration.07': scpg['sConfiguration.03'],
        }));
        const scmgs = Array.isArray(configuration['sConfiguration.MedicationGroup'])
          ? configuration['sConfiguration.MedicationGroup']
          : [configuration['sConfiguration.MedicationGroup']];
        data['dConfiguration.MedicationGroup'] = scmgs.map((scmg) => ({
          _attributes: { UUID: uuidv4() },
          'dConfiguration.08': scmg['sConfiguration.04'],
          'dConfiguration.09': scmg['sConfiguration.05'],
        }));
        data['dConfiguration.10'] = configuration['sConfiguration.06'];
        if (record) {
          record = await record.updateDraft({ versionId: version.id, data, updatedById: user.id }, { transaction });
        } else {
          data['dConfiguration.13'] = { _text: '' };
          data['dConfiguration.16'] = { _text: '' };
          record = await sequelize.models.Configuration.create(
            {
              versionId: version.id,
              isDraft: true,
              createdByAgencyId: this.id,
              stateId: this.stateId,
              data,
              createdById: user.id,
              updatedById: user.id,
            },
            { transaction }
          );
        }
      });
      return record;
    }

    async importDEMCustomConfigurations(user, options) {
      if (!options?.transaction) {
        return sequelize.transaction((transaction) => this.importDEMCustomConfigurations(user, { ...options, transaction }));
      }
      const { transaction } = options;
      const version = await this.getOrCreateDraftVersion(user, { transaction });
      const stateDataSet = await version.getStateDataSet({ transaction });
      const records = [];
      await stateDataSet.parseDEMCustomConfiguration(async (dataSetNemsisVersion, customConfiguration) => {
        let record = await sequelize.models.CustomConfiguration.scope('finalOrNew').findOne({
          where: {
            customElementId: customConfiguration?._attributes?.CustomElementID,
            dataSet: 'DEMDataSet',
            createdByAgencyId: this.id,
          },
          include: ['draft'],
          transaction,
        });
        let data = record ? _.cloneDeep(record.draft ? record.draft.data : record.data) : {};
        data = {
          ...data,
          ...JSON.parse(JSON.stringify(customConfiguration).replace(/"sdCustomConfiguration\./g, '"dCustomConfiguration.')),
        };
        if (record) {
          record = await record.updateDraft({ versionId: version.id, data, updatedById: user.id }, { transaction });
        } else {
          record = await sequelize.models.CustomConfiguration.create(
            {
              versionId: version.id,
              isDraft: true,
              createdByAgencyId: this.id,
              data,
              createdById: user.id,
              updatedById: user.id,
            },
            { transaction }
          );
        }
        records.push(record);
      });
      return records;
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
      const payload = _.pick(attributes, [
        'id',
        'canonicalAgencyId',
        'claimedAgency',
        'nemsisVersion',
        'stateDataSetId',
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
      if (this.stateDataSet) {
        payload.stateDataSet = this.stateDataSet.toJSON();
      }
      return payload;
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
      nemsisVersion: {
        type: DataTypes.STRING,
        field: 'nemsis_version',
      },
      baseNemsisVersion: {
        type: DataTypes.VIRTUAL(DataTypes.STRING, ['nemsisVersion']),
        get() {
          return this.nemsisVersion?.match(/^\d+\.\d+\.\d+/)?.[0];
        },
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
    if (record.isClaimed || record.isDraft) {
      await record.xsdValidate(options);
    }
  });

  sequelizePaginate.paginate(Agency);

  return Agency;
};
