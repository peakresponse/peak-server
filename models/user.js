const bcrypt = require('bcrypt');
const _ = require('lodash');
const Sequelize = require('sequelize');
const sequelizePaginate = require('sequelize-paginate');
const { v4: uuidv4 } = require('uuid');

const mailer = require('../emails/mailer');
const { Base } = require('./base');

module.exports = (sequelize, DataTypes) => {
  class User extends Base {
    static associate(models) {
      User.hasMany(models.Assignment, { as: 'assignments', foreignKey: 'userId' });
      User.hasOne(models.Assignment.scope('current'), { as: 'currentAssignment', foreignKey: 'userId' });
      User.hasMany(models.Dispatcher, { as: 'dispatchers', foreignKey: 'userId' });
      User.hasMany(models.Employment.scope('finalOrNew'), { as: 'employments', foreignKey: 'userId' });
      User.belongsToMany(models.Agency, {
        as: 'agencies',
        through: models.Employment.scope('finalOrNew'),
        otherKey: 'createdByAgencyId',
        foreignKey: 'userId',
      });
      User.hasMany(models.Patient, {
        as: 'createdPatients',
        foreignKey: 'createdById',
      });
      User.hasMany(models.Patient, {
        as: 'updatedPatients',
        foreignKey: 'updatedById',
      });
      User.belongsToMany(models.Psap, {
        as: 'psaps',
        through: models.Dispatcher,
        otherKey: 'psapId',
        foreignKey: 'userId',
      });

      User.hasMany(models.Responder, { as: 'responders', foreignKey: 'userId' });
      User.hasMany(models.Responder.scope('onscene'), { as: 'activeResponders', foreignKey: 'userId' });
      User.belongsToMany(models.Scene, { as: 'scenes', through: models.Responder });
      User.belongsToMany(models.Scene.scope('active'), { as: 'activeScenes', through: models.Responder.scope('onscene') });
    }

    static async register(values, options) {
      /// sanitize values
      const sanitizedValues = _.mapValues(_.pick(values, ['firstName', 'lastName', 'email', 'position', 'password']), (v) =>
        v ? v.trim() : '',
      );
      const user = User.build(sanitizedValues);
      const errors = [];
      /// first check if user with email already exists
      const existingUser = await User.findOne({
        where: { email: { [Sequelize.Op.iLike]: sanitizedValues.email } },
        transaction: options?.transaction,
      });
      if (existingUser) {
        /// add error message
        errors.push(new Sequelize.ValidationErrorItem('Email already registered', 'Validation error', 'email', sanitizedValues.email));
      }
      /// let Sequelize perform attribute validations
      try {
        await user.validate();
      } catch (error) {
        /// add in the Sequelize validation errors
        errors.push(...error.errors);
      }
      /// if we've collected errors, throw
      if (errors.length > 0) {
        throw new Sequelize.ValidationError('Validation Error', errors);
      }
      /// otherwise, create the user and return
      await user.save({ transaction: options?.transaction });
      /// done! return user object
      return user;
    }

    authenticate(password) {
      return bcrypt.compare(password, this.hashedPassword);
    }

    async isEmployedBy(agency, options) {
      const employment = await sequelize.models.Employment.scope('finalOrNew').findOne({
        where: { userId: this.id, createdByAgencyId: agency.id },
        transaction: options?.transaction,
      });
      return employment && employment.isActive ? employment : null;
    }

    async sendPasswordResetEmail(agency, options) {
      if (agency) {
        /// check if there's a corresponding Employment record
        const employment = await sequelize.models.Employment.scope('finalOrNew').findOne({
          where: { userId: this.id, createdByAgencyId: agency.id },
          transaction: options?.transaction,
        });
        if (!employment) {
          throw new Error();
        }
      }
      const baseUrl = agency ? agency.baseUrl : process.env.BASE_URL;
      await this.update(
        {
          passwordResetToken: uuidv4(),
          passwordResetTokenExpiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        },
        options,
      );
      await mailer.send({
        template: 'password-reset',
        message: {
          to: `${this.fullNameAndEmail}`,
        },
        locals: {
          url: `${baseUrl}/auth/reset-password/${this.passwordResetToken}`,
        },
      });
    }

    async sendWelcomeEmail(agency, options) {
      const employment = await sequelize.models.Employment.scope('finalOrNew').findOne({
        where: { userId: this.id, createdByAgencyId: agency.id },
        transaction: options?.transaction,
      });
      if (employment.isPending) {
        await mailer.send({
          template: 'pending',
          message: {
            to: this.fullNameAndEmail,
          },
          locals: {
            firstName: this.firstName,
            agencyName: agency.name,
          },
        });
        // also send emails to personnel admins
        const admins = await agency.getActivePersonnelAdminUsers({ transaction: options?.transaction });
        const promises = [];
        for (const admin of admins) {
          promises.push(
            mailer.send({
              template: 'approve',
              message: {
                to: admin.fullNameAndEmail,
              },
              locals: {
                pendingFullName: this.fullName,
                firstName: admin.firstName,
                agencyName: agency.name,
                url: `${agency.baseUrl}/users`,
              },
            }),
          );
        }
        await Promise.all(promises);
      } else {
        await mailer.send({
          template: 'welcome',
          message: {
            to: `${this.fullNameAndEmail}`,
          },
          locals: {
            firstName: this.firstName,
            isOwner: employment.isOwner,
            agencyName: agency.name,
            agencyUrl: agency.baseUrl,
          },
        });
      }
    }

    toJSON() {
      const attributes = { ...this.get() };
      const json = _.pick(attributes, ['id', 'firstName', 'middleName', 'lastName', 'email', 'position', 'iconFile', 'iconUrl']);
      if (this.employments) {
        json.employments = this.employments.map((employment) => employment.toJSON());
      }
      return json;
    }

    setFromEmployment(employment) {
      this.lastName = employment.lastName;
      this.firstName = employment.firstName;
      this.middleName = employment.middleName;
      this.email = employment.email;
    }
  }

  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'first_name',
        validate: {
          notNull: {
            msg: 'First name cannot be blank',
          },
          notEmpty: {
            msg: 'First name cannot be blank',
          },
        },
      },
      middleName: {
        type: DataTypes.STRING,
        field: 'middle_name',
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'last_name',
        validate: {
          notNull: {
            msg: 'Last name cannot be blank',
          },
          notEmpty: {
            msg: 'Last name cannot be blank',
          },
        },
      },
      email: {
        type: DataTypes.CITEXT,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Email cannot be blank',
          },
          notEmpty: {
            msg: 'Email cannot be blank',
          },
          isValid(value) {
            if (value && value.trim() !== '' && value.match(/^\S+@\S+\.\S+$/) == null) {
              throw new Error('Invalid Email');
            }
          },
        },
      },
      position: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Position cannot be blank',
          },
          notEmpty: {
            msg: 'Position cannot be blank',
          },
        },
      },
      fullName: {
        type: DataTypes.VIRTUAL,
        get() {
          return `${this.firstName} ${this.lastName}`;
        },
        set() {
          throw new Error('Do not try to set the `fullName` value!');
        },
      },
      fullNameAndEmail: {
        type: DataTypes.VIRTUAL,
        get() {
          return `${this.fullName} <${this.email}>`;
        },
        set() {
          throw new Error('Do not try to set the `fullNameAndEmail` value!');
        },
      },
      iconUrl: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.assetUrl('iconFile');
        },
      },
      iconFile: {
        type: DataTypes.STRING,
        field: 'icon_file',
        allowNull: true,
      },
      password: {
        type: DataTypes.VIRTUAL,
        validate: {
          isStrong(value) {
            if (value.match(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,30}$/) == null) {
              throw new Error('Password not secure enough');
            }
          },
        },
      },
      hashedPassword: {
        type: DataTypes.STRING,
        field: 'hashed_password',
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_admin',
      },
      deactivatedAt: {
        type: DataTypes.DATE,
        field: 'deactivated_at',
      },
      passwordResetToken: {
        type: DataTypes.UUID,
        field: 'password_reset_token',
      },
      passwordResetTokenExpiresAt: {
        type: DataTypes.DATE,
        field: 'password_reset_token_expires_at',
      },
      apiKey: {
        type: DataTypes.STRING,
        field: 'api_key',
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
    },
  );

  // eslint-disable-next-line consistent-return
  User.beforeSave((user) => {
    if (user.changed('password')) {
      return bcrypt.hash(user.password, 12).then((hashedPassword) => {
        user.password = null;
        user.hashedPassword = hashedPassword;
        user.passwordResetToken = null;
        user.passwordResetTokenExpiresAt = null;
      });
    }
  });

  User.afterSave(async (user, options) => {
    await user.handleAssetFile('iconFile', options);
  });

  sequelizePaginate.paginate(User);
  return User;
};
