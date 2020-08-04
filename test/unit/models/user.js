'use strict'

const assert = require('assert');
const _ = require('lodash');
const nock = require('nock');
const nodemailerMock = require('nodemailer-mock');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', function () {
  describe('User', function () {
    describe('.register()', function () {
      it('creates a new User', async function () {
        const user = await models.User.register({
          firstName: 'John',
          lastName: 'Doe',
          email: 'jdoe@peakresponse.net',
          position: 'Paramedic',
          password: 'Abcd1234!'
        });
        assert(user);
        assert.strictEqual(user.firstName, 'John');
        assert.strictEqual(user.lastName, 'Doe');
        assert.strictEqual(user.email, 'jdoe@peakresponse.net');
        assert.strictEqual(user.position, 'Paramedic');
        /// password attribute should be cleared
        assert.strictEqual(user.password, null);
        /// hashedPassword should now be set
        assert(user.hashedPassword);
      });

      it('strips leading/trailing whitespace', async function () {
        const user = await models.User.register({
          firstName: ' John  ',
          lastName: ' Doe ',
          email: '  jdoe@peakresponse.net ',
          position: '   Paramedic ',
          password: 'Abcd1234!'
        });
        assert(user);
        assert.strictEqual(user.firstName, 'John');
        assert.strictEqual(user.lastName, 'Doe');
        assert.strictEqual(user.email, 'jdoe@peakresponse.net');
        assert.strictEqual(user.position, 'Paramedic');
      });

      it('validates required fields', async function () {
        await assert.rejects(models.User.register({
          firstName: '',
          lastName: '',
          email: '',
          position: '',
          password: '',
        }), error => {
          assert(error instanceof models.Sequelize.ValidationError);
          assert.strictEqual(error.errors.length, 5);
          assert(_.find(error.errors, { path: 'firstName', message: 'First name cannot be blank' }));
          assert(_.find(error.errors, { path: 'lastName', message: 'Last name cannot be blank' }));
          assert(_.find(error.errors, { path: 'email', message: 'Email cannot be blank' }));
          assert(_.find(error.errors, { path: 'position', message: 'Position cannot be blank' }));
          assert(_.find(error.errors, { path: 'password', message: 'Password not secure enough' }));
          return true;
        });
      });

      it('validates if the password is strong', async function () {
        await assert.rejects(models.User.register({
          firstName: 'John',
          lastName: 'Doe',
          email: 'jdoe@peakresponse.net',
          position: 'Paramedic',
          password: 'ab123!'
        }), error => {
          assert(error instanceof models.Sequelize.ValidationError);
          assert.strictEqual(error.errors.length, 1);
          assert(_.find(error.errors, { path: 'password', message: 'Password not secure enough' }));
          return true;
        });
        await assert.rejects(models.User.register({
          firstName: 'John',
          lastName: 'Doe',
          email: 'jdoe@peakresponse.net',
          position: 'Paramedic',
          password: 'abcdab12341234'
        }), error => {
          assert(error instanceof models.Sequelize.ValidationError);
          assert.strictEqual(error.errors.length, 1);
          assert(_.find(error.errors, { path: 'password', message: 'Password not secure enough' }));
          return true;
        });
      });

      it('validates if the email seems correct (not strict)', async function () {
        await assert.rejects(models.User.register({
          firstName: 'James',
          lastName: 'Doe',
          email: 'jdoe @peakresponse.net',
          position: 'Paramedic',
          password: 'Abcd1234!'
        }), error => {
          assert(error instanceof models.Sequelize.ValidationError);
          assert.strictEqual(error.errors.length, 1);
          assert(_.find(error.errors, { path: 'email', message: 'Invalid Email' }));
          return true;
        });
        await assert.rejects(models.User.register({
          firstName: 'James',
          lastName: 'Doe',
          email: 'jdoe',
          position: 'Paramedic',
          password: 'Abcd1234!'
        }), error => {
          assert(error instanceof models.Sequelize.ValidationError);
          assert.strictEqual(error.errors.length, 1);
          assert(_.find(error.errors, { path: 'email', message: 'Invalid Email' }));
          return true;
        });
        await assert.rejects(models.User.register({
          firstName: 'James',
          lastName: 'Doe',
          email: 'jdoe@natriage',
          position: 'Paramedic',
          password: 'Abcd1234!'
        }), error => {
          assert(error instanceof models.Sequelize.ValidationError);
          assert.strictEqual(error.errors.length, 1);
          assert(_.find(error.errors, { path: 'email', message: 'Invalid Email' }));
          return true;
        });
      });

      it('validates if the email is already registered', async function () {
        const user = await models.User.register({
          firstName: 'John',
          lastName: 'Doe',
          email: 'jdoe@peakresponse.net',
          position: 'Paramedic',
          password: 'Abcd1234!'
        });
        assert(user);
        await assert.rejects(models.User.register({
          firstName: 'James',
          lastName: 'Doe',
          email: 'jdoe@peakresponse.net',
          position: 'Paramedic',
          password: 'Abcd1234!'
        }), error => {
          assert(error instanceof models.Sequelize.ValidationError);
          assert.strictEqual(error.errors.length, 1);
          assert(_.find(error.errors, { path: 'email', message: 'Email already registered' }));
          return true;
        });
      });
    });

    describe('.sendPasswordResetEmail()', function() {
      it('generates a password reset token, expiration date, and sends the email', async function() {
        await helpers.loadFixtures(['users']);
        const user = await models.User.findOne({where: {email: 'regular@peakresponse.net'}});
        assert(user);
        assert(user.passwordResetToken == null);
        assert(user.passwordResetTokenExpiresAt == null);
        await user.sendPasswordResetEmail();
        await user.reload();
        assert(user.passwordResetToken);
        assert(user.passwordResetTokenExpiresAt);
        const emails = nodemailerMock.mock.getSentMail();
        assert.strictEqual(emails.length, 1);
        assert.strictEqual(emails[0].subject, 'Reset your Password');
        assert.strictEqual(emails[0].to, 'Regular User <regular@peakresponse.net>');
        /// if no agency specified, url is on the base
        const resetUrl = `${process.env.BASE_URL}/passwords/reset/${user.passwordResetToken}`;
        assert(emails[0].text.includes(resetUrl));
        assert(emails[0].html.includes(resetUrl));
      });

      it('generates a password reset on the specified agency domain', async function() {
        await helpers.loadFixtures(['states', 'agencies', 'users', 'demographics/dem-agencies', 'demographics/employments']);
        const agency = await models.DemAgency.findOne({where: {subdomain: 'bmacc'}});
        const user = await models.User.findOne({where: {email: 'regular@peakresponse.net'}});
        await user.sendPasswordResetEmail(agency);
        await user.reload();
        assert(user.passwordResetToken);
        assert(user.passwordResetTokenExpiresAt);
        const emails = nodemailerMock.mock.getSentMail();
        assert.strictEqual(emails.length, 1);
        assert.strictEqual(emails[0].subject, 'Reset your Password');
        assert.strictEqual(emails[0].to, 'Regular User <regular@peakresponse.net>');
        /// the reset link url should be on the agency subdomain
        const resetUrl = `${agency.baseUrl}/passwords/reset/${user.passwordResetToken}`;
        assert(emails[0].text.includes(resetUrl));
        assert(emails[0].html.includes(resetUrl));
      });

      it('should raise an exception if the user is not an employee of the specified agency', async function() {
        await helpers.loadFixtures(['states', 'agencies', 'users', 'demographics/dem-agencies', 'demographics/employments']);
        const agency = await models.DemAgency.findOne({where: {subdomain: 'bayshoreambulance'}});
        const user = await models.User.findOne({where: {email: 'regular@peakresponse.net'}});
        await assert.rejects(user.sendPasswordResetEmail(agency));
      });
    });

    describe('.sendWelcomeEmail()', function() {
      it('sends a welcome email for the user in the specified agency', async function() {
        await helpers.loadFixtures(['states', 'agencies', 'users', 'demographics/dem-agencies', 'demographics/employments']);
        const user = await models.User.findOne({where: {email: 'regular@peakresponse.net'}});
        const agency = await models.DemAgency.findOne({where: {subdomain: 'bmacc'}});
        assert(user);
        assert(agency);
        await user.sendWelcomeEmail(agency);
        const emails = nodemailerMock.mock.getSentMail();
        assert.strictEqual(emails.length, 1);
        assert.strictEqual(emails[0].subject, 'Welcome to Peak Response');
        assert.strictEqual(emails[0].to, 'Regular User <regular@peakresponse.net>');
        assert(emails[0].text.includes('Bay Medic Ambulance - Contra Costa'));
        assert(emails[0].html.includes('Bay Medic Ambulance - Contra Costa'));
      });

      it('sends a pending approval email when employment pending', async function() {
        await helpers.loadFixtures(['states', 'agencies', 'users', 'demographics/dem-agencies', 'demographics/employments']);
        const user = await models.User.findOne({where: {email: 'pending@peakresponse.net'}});
        const agency = await models.DemAgency.findOne({where: {subdomain: 'bmacc'}});
        assert(user);
        assert(agency);
        await user.sendWelcomeEmail(agency);
        const emails = nodemailerMock.mock.getSentMail();
        assert.strictEqual(emails.length, 1);
        assert.strictEqual(emails[0].subject, 'Pending Request to Join');
        assert.strictEqual(emails[0].to, 'Pending User <pending@peakresponse.net>');
        assert(emails[0].text.includes('Bay Medic Ambulance - Contra Costa'));
        assert(emails[0].html.includes('Bay Medic Ambulance - Contra Costa'));
      });
    });
  });
});
