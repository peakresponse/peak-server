const _ = require('lodash');
const moment = require('moment');
const { Op, ValidationError, ValidationErrorItem } = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
const uuid = require('uuid/v4');

const mailer = require('../emails/mailer');
const nemsis = require('../lib/nemsis');

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

    static associate(models) {
      // associations can be defined here
      Employment.belongsTo(models.Agency, { as: 'agency' });
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
          options
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
            options
          );
        }
      }
    }

    async sendInvitationEmail(options) {
      const agency = await this.getAgency(options);
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
        'createdAt',
        'updatedAt',
      ]);
      if (this.user) {
        data.user = this.user.toJSON();
      }
      return data;
    }
  }

  Employment.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        autoIncrement: true,
      },
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
      email: {
        type: DataTypes.CITEXT,
        field: 'email',
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
        field: 'invitation_code',
      },
      invitationAt: {
        type: DataTypes.DATE,
        field: 'invitation_at',
      },
      isPending: {
        type: DataTypes.BOOLEAN,
        field: 'is_pending',
        allowNull: false,
        defaultValue: false,
      },
      approvedAt: {
        type: DataTypes.DATE,
        field: 'approved_at',
      },
      refusedAt: {
        type: DataTypes.DATE,
        field: 'refused_at',
      },
      status: {
        type: DataTypes.STRING,
      },
      statusOn: {
        type: DataTypes.DATEONLY,
        field: 'status_on',
      },
      primaryJobRole: {
        type: DataTypes.STRING,
        field: 'primary_job_role',
      },
      hiredOn: {
        type: DataTypes.DATEONLY,
        field: 'hired_on',
      },
      startedOn: {
        type: DataTypes.DATEONLY,
        field: 'started_on',
      },
      endedOn: {
        type: DataTypes.DATEONLY,
        field: 'ended_on',
      },
      isActive: {
        type: DataTypes.VIRTUAL(DataTypes.BOOLEAN, ['isPending', 'refusedAt', 'endedOn']),
        get() {
          return !this.isPending && !this.refusedAt && (this.endedOn == null || moment(this.endedOn).isAfter(moment()));
        },
      },
      isOwner: {
        type: DataTypes.BOOLEAN,
        field: 'is_owner',
      },
      roles: DataTypes.ARRAY(DataTypes.ENUM('BILLING', 'CONFIGURATION', 'PERSONNEL', 'REPORTING')),
      data: DataTypes.JSONB,
      isValid: {
        type: DataTypes.BOOLEAN,
        field: 'is_valid',
      },
    },
    {
      sequelize,
      modelName: 'Employment',
      tableName: 'employments',
      underscored: true,
      validate: {
        async schema() {
          const errors = [];
          if (this.userId) {
            this.validationError = await nemsis.validateSchema('dPersonnel_v3.xsd', 'dPersonnel', 'dPersonnel.PersonnelGroup', this.data);
            this.isValid = this.validationError === null;
            if (!this.isValid) {
              throw this.validationError;
            }
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
            if (this.agencyId) {
              const employment = await Employment.findOne({
                where: { agencyId: this.agencyId, email: this.email },
                transaction: this._validationTransaction,
              });
              if (employment && employment.id !== this.id) {
                errors.push(new ValidationErrorItem('This email has already been used.', 'Validation error', 'dPersonnel.10', this.email));
              }
            }
            if (this.userId) {
              const user = await sequelize.models.User.findOne({ where: { email: this.email }, transaction: this._validationTransaction });
              if (user && user.id !== this.userId) {
                errors.push(new ValidationErrorItem('This email has already been used.', 'Validation error', 'dPersonnel.10', this.email));
              }
            }
          }
          if (errors.length > 0) {
            this.isValid = false;
            throw new ValidationError('Schema validation error', errors);
          }
          this.isValid = true;
        },
      },
    }
  );

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

  Employment.addScope('role', (role) => {
    return {
      where: {
        [Op.or]: [{ isOwner: true }, { roles: { [Op.contains]: [role] } }],
      },
    };
  });

  Employment.beforeValidate((record, options) => {
    record.syncNemsisId(options);
    record.syncFieldAndNemsisValue('lastName', ['dPersonnel.NameGroup', 'dPersonnel.01'], options);
    record.syncFieldAndNemsisValue('firstName', ['dPersonnel.NameGroup', 'dPersonnel.02'], options);
    record.syncFieldAndNemsisValue('middleName', ['dPersonnel.NameGroup', 'dPersonnel.03'], options);
    record.syncFieldAndNemsisValue('email', ['dPersonnel.10'], options);
    record.syncFieldAndNemsisValue('status', ['dPersonnel.31'], options);
    record.syncFieldAndNemsisValue('statusOn', ['dPersonnel.32'], options);
    record.syncFieldAndNemsisValue('hiredOn', ['dPersonnel.33'], options);
    record.syncFieldAndNemsisValue('primaryJobRole', ['dPersonnel.34'], options);
    if (!record.userId && !record.invitationCode) {
      record.setDataValue('invitationCode', uuid.v4());
      record.setDataValue('invitationAt', new Date());
    }
    record._validationTransaction = options.transaction;
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
