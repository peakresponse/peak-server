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
    await helpers.loadFixtures([
      'users',
      'states',
      'counties',
      'cities',
      'psaps',
      'nemsisStateDataSets',
      'nemsisSchematrons',
      'agencies',
      'versions',
      'contacts',
      'employments',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(HttpStatus.OK);
  });

  describe('POST /', () => {
    it('validates required fields', async () => {
      await testSession
        .post('/api/demographics/personnel')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({ data: {} })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('creates a new Employment from data and sends an invite', async () => {
      await testSession
        .post('/api/demographics/personnel')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          data: {
            'dPersonnel.NameGroup': {
              'dPersonnel.01': {
                _text: 'Last',
              },
              'dPersonnel.02': {
                _text: 'First',
              },
            },
            'dPersonnel.10': {
              _text: 'first.last@test.com',
            },
          },
        })
        .expect(HttpStatus.CREATED);
      const employment = await models.Employment.scope('finalOrNew').findOne({ where: { email: 'first.last@test.com' } });
      assert(employment);
      assert.deepStrictEqual(employment.firstName, 'First');
      assert.deepStrictEqual(employment.lastName, 'Last');
      assert.deepStrictEqual(employment.data, {
        _attributes: { UUID: employment.id },
        'dPersonnel.NameGroup': {
          'dPersonnel.01': {
            _text: 'Last',
          },
          'dPersonnel.02': {
            _text: 'First',
          },
        },
        'dPersonnel.10': {
          _text: 'first.last@test.com',
        },
      });
      assert(employment.invitationCode);
      assert(employment.invitationAt);

      const emails = nodemailerMock.mock.getSentMail();
      assert.deepStrictEqual(emails.length, 1);
      assert.deepStrictEqual(emails[0].to, 'First Last <first.last@test.com>');
      assert.deepStrictEqual(emails[0].subject, `You're invited to join Bay Medic Ambulance - Contra Costa on Peak Response`);
    });
  });

  describe('PUT /:id', () => {
    it('updates an Employment and associated User', async () => {
      await testSession
        .put('/api/demographics/personnel/7939c808-820e-42cc-8331-8e31ff951541')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          data: {
            _attributes: { UUID: '7939c808-820e-42cc-8331-8e31ff951541' },
            'dPersonnel.NameGroup': {
              'dPersonnel.01': {
                _text: 'Last',
              },
              'dPersonnel.02': {
                _text: 'First',
              },
              'dPersonnel.03': {
                _text: 'Middle',
              },
            },
            'dPersonnel.10': {
              _text: 'first.last@test.com',
            },
          },
          position: 'Position',
        })
        .expect(HttpStatus.OK);
      const employment = await models.Employment.scope('finalOrNew').findByPk('7939c808-820e-42cc-8331-8e31ff951541');
      const draft = await employment.getDraft();
      assert.deepStrictEqual(draft.lastName, 'Last');
      assert.deepStrictEqual(draft.firstName, 'First');
      assert.deepStrictEqual(draft.middleName, 'Middle');
      assert.deepStrictEqual(draft.email, 'first.last@test.com');
      assert.deepStrictEqual(draft.data, {
        _attributes: { UUID: employment.id },
        'dPersonnel.NameGroup': {
          'dPersonnel.01': {
            _text: 'Last',
          },
          'dPersonnel.02': {
            _text: 'First',
          },
          'dPersonnel.03': {
            _text: 'Middle',
          },
        },
        'dPersonnel.10': {
          _text: 'first.last@test.com',
        },
      });
      // const user = await employment.getUser();
      // assert.deepStrictEqual(user.lastName, 'Last');
      // assert.deepStrictEqual(user.firstName, 'First');
      // assert.deepStrictEqual(user.middleName, 'Middle');
      // assert.deepStrictEqual(user.email, 'first.last@test.com');
      // assert.deepStrictEqual(user.position, 'Position');
    });
  });

  describe('POST /:id/resend-invitation', () => {
    it('resends the invitation email and updates the sent timestamp', async () => {
      const employment = await models.Employment.scope('finalOrNew').findByPk('50c06caf-9706-4305-bc3a-5462a7d20b6f');
      const { invitationAt } = employment;
      await testSession
        .post('/api/demographics/personnel/50c06caf-9706-4305-bc3a-5462a7d20b6f/resend-invitation')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(HttpStatus.NO_CONTENT);
      const emails = nodemailerMock.mock.getSentMail();
      assert.deepStrictEqual(emails.length, 1);
      assert.deepStrictEqual(emails[0].to, 'Invited Member <invited.member@peakresponse.net>');
      assert.deepStrictEqual(emails[0].subject, `You're invited to join Bay Medic Ambulance - Contra Costa on Peak Response`);
      await employment.reload();
      assert.notDeepStrictEqual(employment.invitationAt, invitationAt);
    });
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
        .expect(HttpStatus.ACCEPTED);

      /// start polling for completion
      for (;;) {
        // eslint-disable-next-line no-await-in-loop
        const response = await testSession.get(`/api/demographics/personnel/invite-status`).set('Host', `bmacc.${process.env.BASE_HOST}`);
        if (response.status === 202) {
          // eslint-disable-next-line no-await-in-loop
          await helpers.sleep(250);
        } else {
          assert.deepStrictEqual(response.status, HttpStatus.OK);
          break;
        }
      }

      const employments = await models.Employment.scope('finalOrNew').findAll({
        where: {
          email: ['invitee.one@peakresponse.net', 'invitee.two@peakresponse.net'],
        },
      });
      assert.deepStrictEqual(employments.length, 2);

      const emails = nodemailerMock.mock.getSentMail();
      // eslint-disable-next-line no-nested-ternary
      emails.sort((e1, e2) => (e1.to < e2.to ? -1 : e1.to > e2.to ? 1 : 0));
      assert.deepStrictEqual(emails.length, 2);
      assert.deepStrictEqual(emails[0].to, 'Invitee One <invitee.one@peakresponse.net>');
      assert.deepStrictEqual(emails[0].subject, `You're invited to join Bay Medic Ambulance - Contra Costa on Peak Response`);
      assert.deepStrictEqual(emails[1].to, 'Invitee Two <invitee.two@peakresponse.net>');
      assert.deepStrictEqual(emails[1].subject, `You're invited to join Bay Medic Ambulance - Contra Costa on Peak Response`);
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
        .expect(HttpStatus.ACCEPTED);

      /// start polling for completion
      for (;;) {
        // eslint-disable-next-line no-await-in-loop
        const response = await testSession.get(`/api/demographics/personnel/invite-status`).set('Host', `bmacc.${process.env.BASE_HOST}`);
        if (response.status === 202) {
          // eslint-disable-next-line no-await-in-loop
          await helpers.sleep(250);
        } else {
          assert.deepStrictEqual(response.status, HttpStatus.OK);
          break;
        }
      }

      const employments = await models.Employment.scope('finalOrNew').findAll({
        where: {
          email: ['invitee.one@peakresponse.net', 'invitee.two@peakresponse.net'],
        },
      });
      assert.deepStrictEqual(employments.length, 2);

      const emails = nodemailerMock.mock.getSentMail();
      // eslint-disable-next-line no-nested-ternary
      emails.sort((e1, e2) => (e1.to < e2.to ? -1 : e1.to > e2.to ? 1 : 0));
      assert.deepStrictEqual(emails.length, 2);
      assert.deepStrictEqual(emails[0].to, '<invitee.one@peakresponse.net>');
      assert.deepStrictEqual(emails[0].subject, `You're invited to join Bay Medic Ambulance - Contra Costa on Peak Response`);
      assert.deepStrictEqual(emails[1].to, '<invitee.two@peakresponse.net>');
      assert.deepStrictEqual(emails[1].subject, `You're invited to join Bay Medic Ambulance - Contra Costa on Peak Response`);
    });
  });

  describe('GET /invite/:invitationCode', () => {
    it('returns the email and invitation timestamp for the specified code', async () => {
      const response = await session(app)
        .get('/api/demographics/personnel/invite/eb9f6468-df4e-45d2-801f-c8e45d2fedea')
        .expect(HttpStatus.OK);
      assert.deepStrictEqual(response.body, {
        email: 'invited.member@peakresponse.net',
        invitationAt: '2020-04-06T21:22:10.158Z',
      });
    });

    it('returns not found for an invalid code', async () => {
      await session(app).get('/api/demographics/personnel/invite/asdfasdfasdf').expect(HttpStatus.NOT_FOUND);
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
      const employment = await models.Employment.scope('finalOrNew').findByPk('50c06caf-9706-4305-bc3a-5462a7d20b6f');
      assert.deepStrictEqual(employment.userId, response.body.id);
      assert(!employment.isPending);
      assert.deepStrictEqual(employment.invitationCode, null);
      /// it should have sent out an email
      const emails = nodemailerMock.mock.getSentMail();
      assert.deepStrictEqual(emails.length, 1);
      assert.deepStrictEqual(emails[0].subject, 'Welcome to Peak Response');
      assert.deepStrictEqual(emails[0].to, 'Test User <invited.member@peakresponse.net>');
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
      const employment = await models.Employment.scope('finalOrNew').findByPk('50c06caf-9706-4305-bc3a-5462a7d20b6f');
      assert.deepStrictEqual(employment.userId, response.body.id);
      assert.deepStrictEqual(employment.firstName, 'Different');
      assert.deepStrictEqual(employment.lastName, 'Email');
      assert(!employment.isPending);
      assert.deepStrictEqual(employment.invitationCode, null);
      /// it should have sent out an email
      const emails = nodemailerMock.mock.getSentMail();
      assert.deepStrictEqual(emails.length, 1);
      assert.deepStrictEqual(emails[0].subject, 'Welcome to Peak Response');
      assert.deepStrictEqual(emails[0].to, 'Different Email <different.email@peakresponse.net>');
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
      const employment = await models.Employment.scope('finalOrNew').findOne({
        where: {
          createdByAgencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
          userId: response.body.id,
        },
      });
      assert(employment);
      assert.deepStrictEqual(employment.userId, response.body.id);
      assert.deepStrictEqual(employment.firstName, 'Test');
      assert.deepStrictEqual(employment.lastName, 'User');
      assert.deepStrictEqual(employment.email, 'uninvited.member@peakresponse.net');
      assert(employment.isPending);
      /// it should have sent out an email
      const emails = nodemailerMock.mock.getSentMail();
      assert.deepStrictEqual(emails.length, 3);
      assert.deepStrictEqual(emails[0].subject, 'Pending Request to Join');
      assert.deepStrictEqual(emails[0].to, 'Test User <uninvited.member@peakresponse.net>');
      for (let i = 1; i <= 2; i += 1) {
        assert.deepStrictEqual(emails[i].subject, 'Test User is requesting to join Bay Medic Ambulance - Contra Costa');
      }
    });
  });
});
