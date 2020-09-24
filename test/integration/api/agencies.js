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
    await helpers.loadFixtures(['states', 'agencies', 'users']);
    testSession = session(app);
  });

  describe('GET /', () => {
    beforeEach(async () => {
      await testSession
        .post('/login')
        .send({ email: 'admin@peakresponse.net', password: 'abcd1234' })
        .expect(200);
    });

    it('returns a paginated list of Agency records', async () => {
      const response = await testSession
        .get('/api/agencies/')
        .expect(200)
        .expect('X-Total-Count', '11')
        .expect('Link', '');
      assert.equal(response.body.length, 11);
    });

    it('returns a paginated list of search filtered Agency records', async () => {
      const response = await testSession
        .get('/api/agencies/')
        .query({ search: 'fire' })
        .expect(200)
        .expect('X-Total-Count', '4')
        .expect('Link', '');
      assert.equal(response.body.length, 4);
      assert.equal(
        response.body[0].name,
        'Bodega Bay Fire Protection District'
      );
      for (const facility of response.body) {
        assert(facility.name.match(/fire/i));
      }
    });
  });

  describe('GET /me', () => {
    beforeEach(async () => {
      await helpers.loadFixtures(['employments']);
      await testSession
        .post('/login')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
        .expect(HttpStatus.OK);
    });

    it('returns the demographic Agency record for the current subdomain', async () => {
      const response = await testSession
        .get('/api/agencies/me')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(HttpStatus.OK);
      assert.strictEqual(response.body.subdomain, 'bmacc');
    });

    it('returns not found when called on the naked domain', async () => {
      await testSession.get('/api/agencies/me').expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('GET /validate', () => {
    it('returns unprocessable entity if subdomain is not valid', async () => {
      await testSession
        .get('/api/agencies/validate')
        .query({ subdomain: 'not a valid subdomain' })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('returns conflict if subdomain is taken', async () => {
      await testSession
        .get('/api/agencies/validate')
        .query({ subdomain: 'bmacc' })
        .expect(HttpStatus.CONFLICT);

      /// should be case insensitive
      await testSession
        .get('/api/agencies/validate')
        .query({ subdomain: 'BMACC' })
        .expect(HttpStatus.CONFLICT);
    });

    it('returns success no content if subdomain valid and available', async () => {
      await testSession
        .get('/api/agencies/validate')
        .query({ subdomain: 'validandavailable' })
        .expect(HttpStatus.NO_CONTENT);
    });
  });

  describe('GET /:id', () => {
    it('returns claim details of a claimed agency record', async () => {
      const response = await testSession
        .get('/api/agencies/2d9824fc-5d56-43cb-b7f0-e748a1c1ef4d')
        .expect(HttpStatus.OK);
      assert.deepStrictEqual(
        response.body?.id,
        '9eeb6591-12f8-4036-8af8-6b235153d444'
      );
      assert.deepStrictEqual(response.body?.subdomain, 'bmacc');
    });

    it('returns a suggested subdomain for a non-claimed agency record', async () => {
      const response = await testSession
        .get('/api/agencies/e705f64b-1399-436e-a428-18c8378b3444')
        .expect(HttpStatus.NOT_FOUND);
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
      assert.strictEqual(response.body.subdomain, 'baymedicalameda');
      assert.strictEqual(
        response.body.message,
        'Please join the Bay Medic Ambulance - Alameda Peak Response account. We’ll be using this new software to help organize and document MCIs.'
      );

      const user = await models.User.findOne({
        where: { email: 'jdoe@peakresponse.net' },
      });
      assert(user);
      assert.strictEqual(user.firstName, 'John');
      assert.strictEqual(user.lastName, 'Doe');

      /// it should have sent out an email
      const emails = nodemailerMock.mock.getSentMail();
      assert.strictEqual(emails.length, 1);
      assert.strictEqual(emails[0].subject, 'Welcome to Peak Response');
      assert.strictEqual(emails[0].to, 'John Doe <jdoe@peakresponse.net>');

      const agency = await models.Agency.findByPk(id);
      assert(agency);
      assert.strictEqual(agency.subdomain, 'baymedicalameda');
      assert.strictEqual(agency.createdById, user.id);
      assert.strictEqual(agency.updatedById, user.id);
      assert.strictEqual(
        agency.canonicalAgencyId,
        'e705f64b-1399-436e-a428-18c8378b3444'
      );
      assert.deepStrictEqual(agency.data, {
        _attributes: {
          'pr:isValid': false,
        },
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
      assert.strictEqual(employment.firstName, user.firstName);
      assert.strictEqual(employment.lastName, user.lastName);
      assert.strictEqual(employment.email, user.email);

      /// the new user should also be logged in at this point
      response = await testSession
        .get('/api/users/me')
        .set('Host', `baymedicalameda.${process.env.BASE_HOST}`)
        .expect(HttpStatus.OK);
      assert.strictEqual(response.body.user?.id, user.id);
    });
  });
});
