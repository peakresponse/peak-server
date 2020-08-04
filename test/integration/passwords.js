'use strict'

const assert = require('assert');
const HttpStatus = require('http-status-codes');
const moment = require('moment');
const nodemailerMock = require('nodemailer-mock');
const session = require('supertest-session');

const helpers = require('../helpers');
const app = require('../../app');
const models = require('../../models');

describe('/passwords', function() {
  let testSession;

  beforeEach(async function() {
    await helpers.loadFixtures(['users', 'states', 'agencies', 'demographics/dem-agencies', 'demographics/employments']);
    testSession = session(app);
  });

  describe('POST /forgot', function() {
    it('should send an email with a reset password link', async function() {
      const agency = await models.DemAgency.findOne({where: {subdomain: 'bmacc'}});
      const user = await models.User.findOne({where: {email: 'regular@peakresponse.net'}});
      assert(user.passwordResetToken == null);
      assert(user.passwordResetTokenExpiresAt == null);
      await testSession.post('/passwords/forgot')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({email: 'regular@peakresponse.net', password: 'abcd1234'})
        .expect(HttpStatus.OK);
      /// user should now have a reset token and expiration
      await user.reload();
      assert(user.passwordResetToken);
      assert(user.passwordResetTokenExpiresAt);
      /// it should have sent out an email
      const emails = nodemailerMock.mock.getSentMail();
      assert.strictEqual(emails.length, 1);
      assert.strictEqual(emails[0].subject, 'Reset your Password');
      assert.strictEqual(emails[0].to, 'Regular User <regular@peakresponse.net>');
      /// the reset link url should be on the agency subdomain
      const resetUrl = `${agency.baseUrl}/passwords/reset/${user.passwordResetToken}`;
      assert(emails[0].html.includes(resetUrl));
      assert(emails[0].text.includes(resetUrl));
    });

    it('returns not found for an email that does not match a user', async function() {
      const response = await testSession.post('/passwords/forgot')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({email: 'notfound@peakresponse.net', password: 'abcd1234'})
        .expect(HttpStatus.NOT_FOUND);
      assert(response.text.includes('Email not found'));
    });
  });

  describe('POST /reset/:id', function() {
    let user;
    beforeEach(async function() {
      user = await models.User.findOne({where: {email: 'regular@peakresponse.net'}});
      await user.sendPasswordResetEmail();
    });

    it('should update the password', async function() {
      await testSession.post(`/passwords/reset/${user.passwordResetToken}`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({password: 'Abcd1234!'})
        .expect(HttpStatus.OK);
      /// user should now have a reset token and expiration cleared
      await user.reload();
      assert(user.passwordResetToken == null);
      assert(user.passwordResetTokenExpiresAt == null);
      /// the new password should be set
      assert(await user.authenticate('Abcd1234!'));
    });

    it('returns unprocessable entity for a weak password', async function() {
      const response = await testSession.post(`/passwords/reset/${user.passwordResetToken}`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({password: 'weak'})
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);
      assert(response.text.includes('Password not secure'));
    });

    it('returns not found for an invalid code', async function() {
      let response = await testSession.post(`/passwords/reset/00000000-0000-0000-0000-000000000000`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({password: 'weak'})
        .expect(HttpStatus.NOT_FOUND);
      assert(response.text.includes('The password reset link you used is invalid.'));

      response = await testSession.post(`/passwords/reset/asdfasdfasdf`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({password: 'weak'})
        .expect(HttpStatus.NOT_FOUND);
      assert(response.text.includes('The password reset link you used is invalid.'));
    });

    it('returns gone for an expired code', async function() {      
      await user.update({passwordResetTokenExpiresAt: new Date(Date.now() - 60000)});
      await testSession.post(`/passwords/reset/${user.passwordResetToken}`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({password: 'Strong1!'})
        .expect(HttpStatus.GONE);
    });
  });
});
