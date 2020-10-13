const assert = require('assert');
const HttpStatus = require('http-status-codes');
const nodemailerMock = require('nodemailer-mock');
const session = require('supertest-session');

const helpers = require('../../../helpers');
const app = require('../../../../app');
const models = require('../../../../models');

describe('/api/demographics/personnel', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures(['users', 'states', 'agencies', 'contacts', 'employments']);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(HttpStatus.OK);
  });

  describe('POST /invite', () => {
    it('creates and sends bulk invitations', async () => {
      await testSession
        .post('/api/demographics/personnel/invite')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          message: 'Test message',
          rows: [
            { fullName: 'Invitee One', email: 'invitee.one@peakresponse.net' },
            { fullName: 'Invitee Two', email: 'invitee.two@peakresponse.net' },
          ],
        })
        .expect(HttpStatus.NO_CONTENT);

      const employments = await models.Employment.findAll({
        where: {
          email: ['invitee.one@peakresponse.net', 'invitee.two@peakresponse.net'],
        },
      });
      assert.strictEqual(employments.length, 2);

      const emails = nodemailerMock.mock.getSentMail();
      // eslint-disable-next-line no-nested-ternary
      emails.sort((e1, e2) => (e1.to < e2.to ? -1 : e1.to > e2.to ? 1 : 0));
      assert.strictEqual(emails.length, 2);
      assert.strictEqual(emails[0].to, 'Invitee One <invitee.one@peakresponse.net>');
      assert.strictEqual(emails[0].subject, `You're invited to join Bay Medic Ambulance - Contra Costa on Peak Response`);
      assert.strictEqual(emails[1].to, 'Invitee Two <invitee.two@peakresponse.net>');
      assert.strictEqual(emails[1].subject, `You're invited to join Bay Medic Ambulance - Contra Costa on Peak Response`);
    });

    it('allows blank/empty name fields', async () => {
      await testSession
        .post('/api/demographics/personnel/invite')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          message: 'Test message',
          rows: [
            { fullName: '', email: 'invitee.one@peakresponse.net' },
            { fullName: '', email: 'invitee.two@peakresponse.net' },
          ],
        })
        .expect(HttpStatus.NO_CONTENT);

      const employments = await models.Employment.findAll({
        where: {
          email: ['invitee.one@peakresponse.net', 'invitee.two@peakresponse.net'],
        },
      });
      assert.strictEqual(employments.length, 2);

      const emails = nodemailerMock.mock.getSentMail();
      // eslint-disable-next-line no-nested-ternary
      emails.sort((e1, e2) => (e1.to < e2.to ? -1 : e1.to > e2.to ? 1 : 0));
      assert.strictEqual(emails.length, 2);
      assert.strictEqual(emails[0].to, '<invitee.one@peakresponse.net>');
      assert.strictEqual(emails[0].subject, `You're invited to join Bay Medic Ambulance - Contra Costa on Peak Response`);
      assert.strictEqual(emails[1].to, '<invitee.two@peakresponse.net>');
      assert.strictEqual(emails[1].subject, `You're invited to join Bay Medic Ambulance - Contra Costa on Peak Response`);
    });
  });

  describe('POST /accept', () => {
    it('creates a new user and associates with agency employment by matching email', async () => {
      const response = await testSession
        .post('/api/demographics/personnel/accept')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          agencyId: '',
          invitationCode: '',
          firstName: 'Test',
          lastName: 'User',
          email: 'invited.member@peakresponse.net',
          password: 'Abcd1234!',
          position: 'Invited',
        })
        .expect(HttpStatus.CREATED);
      const employment = await models.Employment.findByPk('50c06caf-9706-4305-bc3a-5462a7d20b6f');
      assert.strictEqual(employment.userId, response.body.id);
      assert(!employment.isPending);
      assert.strictEqual(employment.invitationCode, null);
      /// it should have sent out an email
      const emails = nodemailerMock.mock.getSentMail();
      assert.strictEqual(emails.length, 1);
      assert.strictEqual(emails[0].subject, 'Welcome to Peak Response');
      assert.strictEqual(emails[0].to, 'Test User <invited.member@peakresponse.net>');
    });

    it('creates a new user and associates with agency employment by matching invitation code', async () => {
      const response = await testSession
        .post('/api/demographics/personnel/accept')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          agencyId: '',
          invitationCode: 'eb9f6468-df4e-45d2-801f-c8e45d2fedea',
          firstName: 'Different',
          lastName: 'Email',
          email: 'different.email@peakresponse.net',
          password: 'Abcd1234!',
          position: 'Invited to Different Email',
        })
        .expect(HttpStatus.CREATED);
      const employment = await models.Employment.findByPk('50c06caf-9706-4305-bc3a-5462a7d20b6f');
      assert.strictEqual(employment.userId, response.body.id);
      assert.strictEqual(employment.firstName, 'Different');
      assert.strictEqual(employment.lastName, 'Email');
      assert(!employment.isPending);
      assert.strictEqual(employment.invitationCode, null);
      /// it should have sent out an email
      const emails = nodemailerMock.mock.getSentMail();
      assert.strictEqual(emails.length, 1);
      assert.strictEqual(emails[0].subject, 'Welcome to Peak Response');
      assert.strictEqual(emails[0].to, 'Different Email <different.email@peakresponse.net>');
    });

    it('returns not found for an invalid invitation code', async () => {
      await testSession
        .post('/api/demographics/personnel/accept')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          agencyId: '',
          invitationCode: 'eb9f6468-xxxx-45d2-801f-c8e45d2fedea',
          firstName: 'Different',
          lastName: 'Email',
          email: 'different.email@peakresponse.net',
          password: 'Abcd1234!',
          position: 'Invited to Different Email',
        })
        .expect(HttpStatus.NOT_FOUND);
    });

    it('creates a new user and associates with agency employment pending for unmatched email', async () => {
      const response = await testSession
        .post('/api/demographics/personnel/accept')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          agencyId: '',
          invitationCode: '',
          firstName: 'Test',
          lastName: 'User',
          email: 'uninvited.member@peakresponse.net',
          password: 'Abcd1234!',
          position: 'Uninvited',
        })
        .expect(HttpStatus.ACCEPTED);
      const employment = await models.Employment.findOne({
        where: {
          agencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
          userId: response.body.id,
        },
      });
      assert(employment);
      assert.strictEqual(employment.userId, response.body.id);
      assert(employment.isPending);
      /// it should have sent out an email
      const emails = nodemailerMock.mock.getSentMail();
      assert.strictEqual(emails.length, 1);
      assert.strictEqual(emails[0].subject, 'Pending Request to Join');
      assert.strictEqual(emails[0].to, 'Test User <uninvited.member@peakresponse.net>');
    });
  });
});
