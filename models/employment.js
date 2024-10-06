const _ = require('lodash');
const { DateTime } = require('luxon');
const { Op, ValidationError, ValidationErrorItem } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
const { v4: uuidv4 } = require('uuid');

const mailer = require('../emails/mailer');

const { Base } = require('./base');

const Roles = {
  BILLING: 'BILLING',
  CONFIGURATION: 'CONFIGURATION',
  PERSONNEL: 'PERSONNEL',
  REPORTING: 'REPORTING',
};
Roles.ALL_ROLES = [Roles.BILLING, Roles.CONFIGURATION, Roles.PERSONNEL, Roles.REPORTING];
Object.freeze(Roles);

module.exports = (sequelize, DataTypes) => {
  class Employment extends Base {
    static get Roles() {
      return Roles;
    }

    static get xsdPath() {
      return 'dPersonnel_v3.xsd';
    }

    static get rootTag() {
      return 'dPersonnel';
    }

    static get groupTag() {
      return 'dPersonnel.PersonnelGroup';
    }

    static associate(models) {
      // associations can be defined here
      Employment.belongsTo(models.Version, { as: 'version' });
      Employment.belongsTo(Employment, { as: 'draftParent' });
      Employment.hasOne(Employment, { as: 'draft', foreignKey: 'draftParentId' });
      Employment.belongsTo(models.Agency, { as: 'createdByAgency' });
      Employment.belongsTo(models.User, { as: 'user' });
      Employment.belongsTo(models.User, { as: 'updatedBy' });
      Employment.belongsTo(models.User, { as: 'createdBy' });
      Employment.belongsTo(models.User, { as: 'approvedBy' });
      Employment.belongsTo(models.User, { as: 'refusedBy' });
    }

    async approve(user, options) {
      if (this.isPending) {
        await this.update(
          {
            isPending: false,
            approvedAt: new Date(),
            approvedById: user.id,
          },
          options,
        );
      }
    }

    async refuse(user, options) {
      if (this.isPending) {
        if (this.isPending) {
          await this.update(
            {
              isPending: false,
              refusedAt: new Date(),
              refusedById: user.id,
            },
            options,
          );
        }
      }
    }

    async sendInvitationEmail(options) {
      const agency = await this.getCreatedByAgency(options);
      const user = await this.getCreatedBy(options);
      await mailer.send({
        template: 'invitation',
        message: {
          to: `${this.fullNameAndEmail}`,
        },
        locals: {
          agencyName: agency?.name,
          senderName: user?.fullName,
          url: `${agency?.baseUrl}/sign-up?invitationCode=${this.invitationCode}`,
        },
      });
    }

    setUser(user) {
      this.userId = user.id;
      this.lastName = user.lastName;
      this.firstName = user.firstName;
      this.middleName = user.middleName;
      this.email = user.email;
    }

    async toFullJSON(options) {
      const json = this.toJSON();
      json.user = (this.user || (await this.getUser(options)))?.toJSON();
      return json;
    }

    toJSON() {
      const attributes = { ...this.get() };
      const data = _.pick(attributes, [
        'id',
        'isDraft',
        'userId',
        'firstName',
        'middleName',
        'lastName',
        'email',
        'primaryJobRole',
        'isPending',
        'approvedAt',
        'refusedAt',
        'roles',
        'isOwner',
        'invitationAt',
        'hiredOn',
        'startedOn',
        'endedOn',
        'status',
        'statusOn',
        'data',
        'isValid',
        'validationErrors',
        'createdAt',
        'updatedAt',
        'archivedAt',
      ]);
      if (this.draft) {
        data.draft = this.draft.toJSON();
      }
      if (this.user) {
        data.user = this.user.toJSON();
      }
      return data;
    }
  }

  Employment.init(
    {
      isDraft: {
        type: DataTypes.BOOLEAN,
      },
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        autoIncrement: true,
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
      email: {
        type: DataTypes.CITEXT,
      },
      fullName: {
        type: DataTypes.VIRTUAL,
        get() {
          const name = `${this.firstName ?? ''} ${this.middleName ?? ''}`.trim();
          return `${name} ${this.lastName ?? ''}`.trim();
        },
        set(value) {
          const words = value?.split(/\s+/) ?? [];
          if (words.length > 0) {
            [this.firstName] = words;
          } else {
            this.firstName = null;
          }
          if (words.length > 1) {
            this.lastName = words[words.length - 1];
          } else {
            this.lastName = null;
          }
          if (words.length > 2) {
            this.middleName = words.slice(1, words.length - 1).join(' ');
          } else {
            this.middleName = null;
          }
        },
      },
      fullNameAndEmail: {
        type: DataTypes.VIRTUAL,
        get() {
          return `${this.fullName} <${this.email}>`.trim();
        },
      },
      invitationCode: {
        type: DataTypes.UUID,
      },
      invitationAt: {
        type: DataTypes.DATE,
      },
      isPending: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      approvedAt: {
        type: DataTypes.DATE,
      },
      refusedAt: {
        type: DataTypes.DATE,
      },
      status: {
        type: DataTypes.STRING,
      },
      statusOn: {
        type: DataTypes.DATEONLY,
      },
      primaryJobRole: {
        type: DataTypes.STRING,
      },
      hiredOn: {
        type: DataTypes.DATEONLY,
      },
      startedOn: {
        type: DataTypes.DATEONLY,
      },
      endedOn: {
        type: DataTypes.DATEONLY,
      },
      isActive: {
        type: DataTypes.VIRTUAL(DataTypes.BOOLEAN, ['isPending', 'refusedAt', 'endedOn']),
        get() {
          return !this.isPending && !this.refusedAt && (this.endedOn == null || DateTime.fromISO(this.endedOn) > DateTime.now());
        },
      },
      isOwner: {
        type: DataTypes.BOOLEAN,
      },
      roles: DataTypes.ARRAY(DataTypes.ENUM('BILLING', 'CONFIGURATION', 'PERSONNEL', 'REPORTING')),
      data: DataTypes.JSONB,
      isValid: {
        type: DataTypes.BOOLEAN,
      },
      validationErrors: {
        type: DataTypes.JSONB,
      },
      archivedAt: {
        type: DataTypes.DATE,
      },
      isImporting: DataTypes.VIRTUAL(DataTypes.BOOLEAN),
    },
    {
      sequelize,
      modelName: 'Employment',
      tableName: 'employments',
      underscored: true,
      validate: {
        async extra() {
          if (this.isImporting) {
            return;
          }
          const errors = [];
          if (this.userId) {
            // perform some extra validations since EVERYTHING is optional in NEMSIS
            // require at least first name, last name for existing users
            if (!this.lastName) {
              errors.push(new ValidationErrorItem('This field is required.', 'Validation error', 'dPersonnel.01', this.lastName));
            }
            if (!this.firstName) {
              errors.push(new ValidationErrorItem('This field is required.', 'Validation error', 'dPersonnel.02', this.firstName));
            }
          }
          // always require at least email (so that invitation can be sent as needed)
          if (!this.email) {
            errors.push(new ValidationErrorItem('This field is required.', 'Validation error', 'dPersonnel.10', this.email));
          } else {
            // perform the uniqueness check here so we attach to the NEMSIS field
            if (this.createdByAgencyId) {
              const employment = await Employment.findOne({
                where: {
                  [Op.and]: [{ id: { [Op.not]: this.id } }, { id: { [Op.not]: this.draftParentId } }],
                  createdByAgencyId: this.createdByAgencyId,
                  email: this.email,
                },
                transaction: this._validationTransaction,
              });
              if (employment) {
                errors.push(new ValidationErrorItem('This email has already been used.', 'Validation error', 'dPersonnel.10', this.email));
              }
            }
            if (this.userId) {
              const user = await sequelize.models.User.findOne({
                where: {
                  id: { [Op.not]: this.userId },
                  email: this.email,
                },
                transaction: this._validationTransaction,
              });
              if (user) {
                errors.push(new ValidationErrorItem('This email has already been used.', 'Validation error', 'dPersonnel.10', this.email));
              }
            }
          }
          if (errors.length > 0) {
            this.isValid = false;
            throw new ValidationError('Schema validation error', errors);
          }
        },
      },
    },
  );

  Employment.addDraftScopes();

  Employment.addScope('active', {
    where: {
      endedOn: {
        [Op.or]: [null, { [Op.gt]: sequelize.literal('NOW()') }],
      },
      isPending: false,
      refusedAt: null,
      userId: {
        [Op.not]: null,
      },
    },
  });

  Employment.addScope('role', (role) => ({
    where: {
      [Op.or]: [{ isOwner: true }, { roles: { [Op.contains]: [role] } }],
    },
  }));

  Employment.beforeValidate(async (record, options) => {
    record.syncNemsisId(options);
    record.syncFieldAndNemsisValue('lastName', ['dPersonnel.NameGroup', 'dPersonnel.01'], options);
    record.syncFieldAndNemsisValue('firstName', ['dPersonnel.NameGroup', 'dPersonnel.02'], options);
    record.syncFieldAndNemsisValue('middleName', ['dPersonnel.NameGroup', 'dPersonnel.03'], options);
    record.syncFieldAndNemsisValue('email', ['dPersonnel.10'], options);
    record.syncFieldAndNemsisValue('status', ['dPersonnel.31'], options);
    record.syncFieldAndNemsisValue('statusOn', ['dPersonnel.32'], options);
    record.syncFieldAndNemsisValue('hiredOn', ['dPersonnel.33'], options);
    record.syncFieldAndNemsisValue('primaryJobRole', ['dPersonnel.34'], options);
    if (!record.isImporting && !record.userId && !record.invitationCode) {
      record.setDataValue('invitationCode', uuidv4());
      record.setDataValue('invitationAt', new Date());
    }
    record._validationTransaction = options.transaction;
    await record.xsdValidate(options);
  });

  Employment.afterValidate((record) => {
    delete record._validationTransaction;
  });

  Employment.afterSave(async (record, options) => {
    if (record.invitationCode && record.changed('email')) {
      await record.sendInvitationEmail(options);
    }
  });

  sequelizePaginate.paginate(Employment);

  return Employment;
};
