const assert = require('assert');
const HttpStatus = require('http-status-codes');
const nodemailerMock = require('nodemailer-mock');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');

describe('/api/agencies', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures(['states', 'counties', 'cities', 'psaps', 'users', 'agencies', 'versions', 'employments']);
    testSession = session(app);
  });

  describe('GET /', () => {
    beforeEach(async () => {
      await testSession.post('/login').send({ email: 'admin@peakresponse.net', password: 'abcd1234' }).expect(HttpStatus.OK);
    });

    it('returns a paginated list of Agency records', async () => {
      const response = await testSession.get('/api/agencies/').expect(HttpStatus.OK).expect('X-Total-Count', '12').expect('Link', '');
      assert.deepStrictEqual(response.body.length, 12);
    });

    it('returns a paginated list of search filtered Agency records', async () => {
      const response = await testSession
        .get('/api/agencies/')
        .query({ search: 'fire' })
        .expect(HttpStatus.OK)
        .expect('X-Total-Count', '5')
        .expect('Link', '');
      assert.deepStrictEqual(response.body.length, 5);
      assert.deepStrictEqual(response.body[0].name, 'Bodega Bay Fire Protection District');
      for (const facility of response.body) {
        assert(facility.name.match(/fire/i));
      }
    });
  });

  describe('POST /', () => {
    it('requires an administrative superuser', async () => {
      await testSession.post('/api/agencies').set('Accept', 'application/json').send({}).expect(HttpStatus.UNAUTHORIZED);

      await testSession
        .post('/login')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
        .expect(HttpStatus.OK);

      await testSession.post('/api/agencies').set('Accept', 'application/json').send({}).expect(HttpStatus.FORBIDDEN);
    });

    it('creates a new canonical agency record', async () => {
      await testSession.post('/login').send({ email: 'admin@peakresponse.net', password: 'abcd1234' }).expect(HttpStatus.OK);
      const response = await testSession
        .post('/api/agencies')
        .send({
          stateUniqueId: 'DEMO-001',
          number: 'DEMO-001',
          name: 'Demo Agency',
          stateId: '06',
        })
        .expect(HttpStatus.CREATED);
      assert(response.body.id);
      const agency = await models.Agency.findByPk(response.body.id, { rejectOnEmpty: true });
      assert.deepStrictEqual(agency.stateUniqueId, 'DEMO-001');
      assert.deepStrictEqual(agency.number, 'DEMO-001');
      assert.deepStrictEqual(agency.name, 'Demo Agency');
      assert.deepStrictEqual(agency.stateId, '06');
      assert.deepStrictEqual(agency.data, {
        'sAgency.01': {
          _text: 'DEMO-001',
        },
        'sAgency.02': {
          _text: 'DEMO-001',
        },
        'sAgency.03': {
          _text: 'Demo Agency',
        },
      });
    });
  });

  describe('PATCH /:id', () => {
    it('updates an existing Agency record', async () => {
      await testSession.post('/login').send({ email: 'admin@peakresponse.net', password: 'abcd1234' }).expect(HttpStatus.OK);
      await testSession
        .patch('/api/agencies/9466185d-6ad7-429a-9081-4426d2398f9f')
        .send({
          stateUniqueId: 'Test Id',
          number: 'Test Number',
          name: 'Test Name',
        })
        .expect(HttpStatus.OK);
      const agency = await models.Agency.findByPk('9466185d-6ad7-429a-9081-4426d2398f9f');
      assert.deepStrictEqual(agency.stateUniqueId, 'Test Id');
      assert.deepStrictEqual(agency.number, 'Test Number');
      assert.deepStrictEqual(agency.name, 'Test Name');
      assert.deepStrictEqual(agency.data, {
        'sAgency.01': { _text: 'Test Id' },
        'sAgency.02': { _text: 'Test Number' },
        'sAgency.03': { _text: 'Test Name' },
      });
    });
  });

  describe('GET /me', () => {
    beforeEach(async () => {
      await testSession
        .post('/login')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
        .expect(HttpStatus.OK);
    });

    it('returns the demographic Agency record for the current subdomain', async () => {
      const response = await testSession.get('/api/agencies/me').set('Host', `bmacc.${process.env.BASE_HOST}`).expect(HttpStatus.OK);
      assert.deepStrictEqual(response.body.subdomain, 'bmacc');
    });

    it('returns not found when called on the naked domain', async () => {
      await testSession.get('/api/agencies/me').expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('GET /validate', () => {
    it('returns unprocessable entity if subdomain is not valid', async () => {
      await testSession.get('/api/agencies/validate').query({ subdomain: 'not a valid subdomain' }).expect(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('returns conflict if subdomain is taken', async () => {
      await testSession.get('/api/agencies/validate').query({ subdomain: 'bmacc' }).expect(HttpStatus.CONFLICT);

      /// should be case insensitive
      await testSession.get('/api/agencies/validate').query({ subdomain: 'BMACC' }).expect(HttpStatus.CONFLICT);
    });

    it('returns success no content if subdomain valid and available', async () => {
      await testSession.get('/api/agencies/validate').query({ subdomain: 'validandavailable' }).expect(HttpStatus.NO_CONTENT);
    });
  });

  describe('GET /:id/check', () => {
    it('returns claim details of a claimed agency record', async () => {
      const response = await testSession.get('/api/agencies/2d9824fc-5d56-43cb-b7f0-e748a1c1ef4d/check').expect(HttpStatus.OK);
      assert.deepStrictEqual(response.body?.id, '9eeb6591-12f8-4036-8af8-6b235153d444');
      assert.deepStrictEqual(response.body?.subdomain, 'bmacc');
    });

    it('returns a suggested subdomain for a non-claimed agency record', async () => {
      const response = await testSession.get('/api/agencies/e705f64b-1399-436e-a428-18c8378b3444/check').expect(HttpStatus.NOT_FOUND);
      assert.deepStrictEqual(response.body?.subdomain, 'bmaa');
    });
  });

  describe('POST /:id/claim', () => {
    it('registers a new User and creates new demographic Agency records for a given state Agency', async () => {
      let response = await testSession
        .post('/api/agencies/e705f64b-1399-436e-a428-18c8378b3444/claim')
        .send({
          subdomain: 'baymedicalameda',
          firstName: 'John',
          lastName: 'Doe',
          email: 'jdoe@peakresponse.net',
          position: 'Founder',
          password: 'Abcd1234!',
        })
        .expect(HttpStatus.CREATED);
      const { id } = response.body;
      assert(id);
      assert.deepStrictEqual(response.body.subdomain, 'baymedicalameda');
      assert.deepStrictEqual(
        response.body.message,
        'Please join the Bay Medic Ambulance - Alameda Peak Response account. We’ll be using this new software to help organize and document MCIs.'
      );

      const user = await models.User.findOne({
        where: { email: 'jdoe@peakresponse.net' },
      });
      assert(user);
      assert.deepStrictEqual(user.firstName, 'John');
      assert.deepStrictEqual(user.lastName, 'Doe');

      /// it should have sent out an email
      const emails = nodemailerMock.mock.getSentMail();
      assert.deepStrictEqual(emails.length, 1);
      assert.deepStrictEqual(emails[0].subject, 'Welcome to Peak Response');
      assert.deepStrictEqual(emails[0].to, 'John Doe <jdoe@peakresponse.net>');

      const agency = await models.Agency.findByPk(id);
      assert(agency);
      assert.deepStrictEqual(agency.subdomain, 'baymedicalameda');
      assert.deepStrictEqual(agency.createdById, user.id);
      assert.deepStrictEqual(agency.updatedById, user.id);
      assert.deepStrictEqual(agency.canonicalAgencyId, 'e705f64b-1399-436e-a428-18c8378b3444');
      assert.deepStrictEqual(agency.data, {
        'dAgency.01': {
          _text: 'S01-50120',
        },
        'dAgency.02': {
          _text: 'S01-50120',
        },
        'dAgency.03': {
          _text: 'Bay Medic Ambulance - Alameda',
        },
        'dAgency.04': {
          _text: '06',
        },
      });

      const employment = await models.Employment.findOne({
        where: { agencyId: agency.id, userId: user.id },
      });
      assert(employment);
      assert(employment.isOwner);
      assert.deepStrictEqual(employment.firstName, user.firstName);
      assert.deepStrictEqual(employment.lastName, user.lastName);
      assert.deepStrictEqual(employment.email, user.email);

      /// the new user should also be logged in at this point
      response = await testSession
        .get('/api/users/me')
        .set('Host', `baymedicalameda.${process.env.BASE_HOST}`)
        .set('X-Api-Level', '2')
        .expect(HttpStatus.OK);
      assert.deepStrictEqual(response.body.User?.id, user.id);
    });
  });
});
