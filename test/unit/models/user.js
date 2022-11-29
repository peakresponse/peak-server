const assert = require('assert');
const _ = require('lodash');
const nodemailerMock = require('nodemailer-mock');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('User', () => {
    describe('.register()', () => {
      it('creates a new User', async () => {
        const user = await models.User.register({
          firstName: 'John',
          lastName: 'Doe',
          email: 'jdoe@peakresponse.net',
          position: 'Paramedic',
          password: 'Abcd1234!',
        });
        assert(user);
        assert.deepStrictEqual(user.firstName, 'John');
        assert.deepStrictEqual(user.lastName, 'Doe');
        assert.deepStrictEqual(user.email, 'jdoe@peakresponse.net');
        assert.deepStrictEqual(user.position, 'Paramedic');
        /// password attribute should be cleared
        assert.deepStrictEqual(user.password, null);
        /// hashedPassword should now be set
        assert(user.hashedPassword);
      });

      it('strips leading/trailing whitespace', async () => {
        const user = await models.User.register({
          firstName: ' John  ',
          lastName: ' Doe ',
          email: '  jdoe@peakresponse.net ',
          position: '   Paramedic ',
          password: 'Abcd1234!',
        });
        assert(user);
        assert.deepStrictEqual(user.firstName, 'John');
        assert.deepStrictEqual(user.lastName, 'Doe');
        assert.deepStrictEqual(user.email, 'jdoe@peakresponse.net');
        assert.deepStrictEqual(user.position, 'Paramedic');
      });

      it('validates required fields', async () => {
        await assert.rejects(
          models.User.register({
            firstName: '',
            lastName: '',
            email: '',
            position: '',
            password: '',
          }),
          (error) => {
            assert(error instanceof models.Sequelize.ValidationError);
            assert.deepStrictEqual(error.errors.length, 5);
            assert(
              _.find(error.errors, {
                path: 'firstName',
                message: 'First name cannot be blank',
              })
            );
            assert(
              _.find(error.errors, {
                path: 'lastName',
                message: 'Last name cannot be blank',
              })
            );
            assert(
              _.find(error.errors, {
                path: 'email',
                message: 'Email cannot be blank',
              })
            );
            assert(
              _.find(error.errors, {
                path: 'position',
                message: 'Position cannot be blank',
              })
            );
            assert(
              _.find(error.errors, {
                path: 'password',
                message: 'Password not secure enough',
              })
            );
            return true;
          }
        );
      });

      it('validates if the password is strong', async () => {
        await assert.rejects(
          models.User.register({
            firstName: 'John',
            lastName: 'Doe',
            email: 'jdoe@peakresponse.net',
            position: 'Paramedic',
            password: 'ab123!',
          }),
          (error) => {
            assert(error instanceof models.Sequelize.ValidationError);
            assert.deepStrictEqual(error.errors.length, 1);
            assert(
              _.find(error.errors, {
                path: 'password',
                message: 'Password not secure enough',
              })
            );
            return true;
          }
        );
        await assert.rejects(
          models.User.register({
            firstName: 'John',
            lastName: 'Doe',
            email: 'jdoe@peakresponse.net',
            position: 'Paramedic',
            password: 'abcdab12341234',
          }),
          (error) => {
            assert(error instanceof models.Sequelize.ValidationError);
            assert.deepStrictEqual(error.errors.length, 1);
            assert(
              _.find(error.errors, {
                path: 'password',
                message: 'Password not secure enough',
              })
            );
            return true;
          }
        );
      });

      it('validates if the email seems correct (not strict)', async () => {
        await assert.rejects(
          models.User.register({
            firstName: 'James',
            lastName: 'Doe',
            email: 'jdoe @peakresponse.net',
            position: 'Paramedic',
            password: 'Abcd1234!',
          }),
          (error) => {
            assert(error instanceof models.Sequelize.ValidationError);
            assert.deepStrictEqual(error.errors.length, 1);
            assert(_.find(error.errors, { path: 'email', message: 'Invalid Email' }));
            return true;
          }
        );
        await assert.rejects(
          models.User.register({
            firstName: 'James',
            lastName: 'Doe',
            email: 'jdoe',
            position: 'Paramedic',
            password: 'Abcd1234!',
          }),
          (error) => {
            assert(error instanceof models.Sequelize.ValidationError);
            assert.deepStrictEqual(error.errors.length, 1);
            assert(_.find(error.errors, { path: 'email', message: 'Invalid Email' }));
            return true;
          }
        );
        await assert.rejects(
          models.User.register({
            firstName: 'James',
            lastName: 'Doe',
            email: 'jdoe@natriage',
            position: 'Paramedic',
            password: 'Abcd1234!',
          }),
          (error) => {
            assert(error instanceof models.Sequelize.ValidationError);
            assert.deepStrictEqual(error.errors.length, 1);
            assert(_.find(error.errors, { path: 'email', message: 'Invalid Email' }));
            return true;
          }
        );
      });

      it('validates if the email is already registered', async () => {
        const user = await models.User.register({
          firstName: 'John',
          lastName: 'Doe',
          email: 'jdoe@peakresponse.net',
          position: 'Paramedic',
          password: 'Abcd1234!',
        });
        assert(user);
        await assert.rejects(
          models.User.register({
            firstName: 'James',
            lastName: 'Doe',
            email: 'jdoe@peakresponse.net',
            position: 'Paramedic',
            password: 'Abcd1234!',
          }),
          (error) => {
            assert(error instanceof models.Sequelize.ValidationError);
            assert.deepStrictEqual(error.errors.length, 1);
            assert(
              _.find(error.errors, {
                path: 'email',
                message: 'Email already registered',
              })
            );
            return true;
          }
        );
      });
    });

    describe('.sendPasswordResetEmail()', () => {
      it('generates a password reset token, expiration date, and sends the email', async () => {
        await helpers.loadFixtures(['users']);
        const user = await models.User.findOne({
          where: { email: 'regular@peakresponse.net' },
        });
        assert(user);
        assert(user.passwordResetToken == null);
        assert(user.passwordResetTokenExpiresAt == null);
        await user.sendPasswordResetEmail();
        await user.reload();
        assert(user.passwordResetToken);
        assert(user.passwordResetTokenExpiresAt);
        const emails = nodemailerMock.mock.getSentMail();
        assert.deepStrictEqual(emails.length, 1);
        assert.deepStrictEqual(emails[0].subject, 'Reset your Password');
        assert.deepStrictEqual(emails[0].to, 'Regular User <regular@peakresponse.net>');
        /// if no agency specified, url is on the base
        const resetUrl = `${process.env.BASE_URL}/auth/reset-password/${user.passwordResetToken}`;
        assert(emails[0].text.includes(resetUrl));
        assert(emails[0].html.includes(resetUrl));
      });

      it('generates a password reset on the specified agency domain', async () => {
        await helpers.loadFixtures(['states', 'counties', 'cities', 'psaps', 'agencies', 'users', 'employments']);
        const agency = await models.Agency.findOne({
          where: { subdomain: 'bmacc' },
        });
        const user = await models.User.findOne({
          where: { email: 'regular@peakresponse.net' },
        });
        await user.sendPasswordResetEmail(agency);
        await user.reload();
        assert(user.passwordResetToken);
        assert(user.passwordResetTokenExpiresAt);
        const emails = nodemailerMock.mock.getSentMail();
        assert.deepStrictEqual(emails.length, 1);
        assert.deepStrictEqual(emails[0].subject, 'Reset your Password');
        assert.deepStrictEqual(emails[0].to, 'Regular User <regular@peakresponse.net>');
        /// the reset link url should be on the agency subdomain
        const resetUrl = `${agency.baseUrl}/auth/reset-password/${user.passwordResetToken}`;
        assert(emails[0].text.includes(resetUrl));
        assert(emails[0].html.includes(resetUrl));
      });

      it('should raise an exception if the user is not an employee of the specified agency', async () => {
        await helpers.loadFixtures(['states', 'counties', 'cities', 'psaps', 'agencies', 'users', 'employments']);
        const agency = await models.Agency.findOne({
          where: { subdomain: 'bayshoreambulance' },
        });
        const user = await models.User.findOne({
          where: { email: 'regular@peakresponse.net' },
        });
        await assert.rejects(user.sendPasswordResetEmail(agency));
      });
    });

    describe('.sendWelcomeEmail()', () => {
      it('sends a welcome email for the user in the specified agency', async () => {
        await helpers.loadFixtures(['states', 'counties', 'cities', 'psaps', 'agencies', 'users', 'employments']);
        const user = await models.User.findOne({
          where: { email: 'regular@peakresponse.net' },
        });
        const agency = await models.Agency.findOne({
          where: { subdomain: 'bmacc' },
        });
        assert(user);
        assert(agency);
        await user.sendWelcomeEmail(agency);
        const emails = nodemailerMock.mock.getSentMail();
        assert.deepStrictEqual(emails.length, 1);
        assert.deepStrictEqual(emails[0].subject, 'Welcome to Peak Response');
        assert.deepStrictEqual(emails[0].to, 'Regular User <regular@peakresponse.net>');
        assert(emails[0].text.includes('Bay Medic Ambulance - Contra Costa'));
        assert(emails[0].html.includes('Bay Medic Ambulance - Contra Costa'));
      });

      it('sends a pending approval email when employment pending', async () => {
        await helpers.loadFixtures(['states', 'counties', 'cities', 'psaps', 'agencies', 'users', 'employments']);
        const user = await models.User.findOne({
          where: { email: 'pending@peakresponse.net' },
        });
        const agency = await models.Agency.findOne({
          where: { subdomain: 'bmacc' },
        });
        assert(user);
        assert(agency);
        await user.sendWelcomeEmail(agency);
        const emails = nodemailerMock.mock.getSentMail();
        assert.deepStrictEqual(emails.length, 3);
        assert.deepStrictEqual(emails[0].subject, 'Pending Request to Join');
        assert.deepStrictEqual(emails[0].to, 'Pending User <pending@peakresponse.net>');
        assert(emails[0].text.includes('Bay Medic Ambulance - Contra Costa'));
        assert(emails[0].html.includes('Bay Medic Ambulance - Contra Costa'));

        for (let i = 1; i <= 2; i += 1) {
          assert.deepStrictEqual(emails[i].subject, 'Pending User is requesting to join Bay Medic Ambulance - Contra Costa');
          assert(emails[i].text.includes(`${agency.baseUrl}/users`));
          assert(emails[i].html.includes(`${agency.baseUrl}/users`));
        }
      });
    });

    describe('.getActiveScenes', () => {
      it('returns all active Scenes the user is a Responder to', async () => {
        await helpers.loadFixtures([
          'users',
          'cities',
          'states',
          'counties',
          'psaps',
          'agencies',
          'vehicles',
          'assignments',
          'contacts',
          'employments',
          'scenes',
          'responders',
        ]);
        const user = await models.User.findOne({
          where: { email: 'regular@peakresponse.net' },
        });
        const scenes = await user.getActiveScenes();
        assert.deepStrictEqual(scenes.length, 1);
        assert.deepStrictEqual(scenes[0].id, '25db9094-03a5-4267-8314-bead229eff9d');
      });
    });
  });
});
