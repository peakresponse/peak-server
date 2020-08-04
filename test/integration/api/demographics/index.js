'use strict'

const assert = require('assert');
const HttpStatus = require('http-status-codes');
const nodemailerMock = require('nodemailer-mock');
const session = require('supertest-session');

const helpers = require('../../../helpers');
const app = require('../../../../app');
const models = require('../../../../models');

describe('/api/demographics', function() {
  let testSession;

  beforeEach(async function() {
    await helpers.loadFixtures(['users', 'states', 'agencies']);
    testSession = session(app);
  });

  describe('GET /validate', function() {
    it('returns unprocessable entity if subdomain is not valid', async function() {
      await testSession.get('/api/demographics/validate')
        .query({subdomain: 'not a valid subdomain'})
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('returns conflict if subdomain is taken', async function() {
      await helpers.loadFixtures(['demographics/dem-agencies']);
      await testSession.get('/api/demographics/validate')
        .query({subdomain: 'bmacc'})
        .expect(HttpStatus.CONFLICT);

      /// should be case insensitive
      await testSession.get('/api/demographics/validate')
        .query({subdomain: 'BMACC'})
        .expect(HttpStatus.CONFLICT);
    });

    it('returns success no content if subdomain valid and available', async function() {
      await testSession.get('/api/demographics/validate')
        .query({subdomain: 'validandavailable'})
        .expect(HttpStatus.NO_CONTENT);
    });
  });

  describe('POST /', function() {
    it('registers a new User and creates new demographic Agency records for a given state Agency', async function() {
      let response = await testSession.post('/api/demographics')
        .send({
          agencyId: 'e705f64b-1399-436e-a428-18c8378b3444',
          subdomain: 'baymedicalameda',
          firstName: 'John',
          lastName: 'Doe',
          email: 'jdoe@peakresponse.net',
          position: 'Founder',
          password: 'Abcd1234!'
        })
        .expect(HttpStatus.CREATED);
      const id = response.body.id;
      assert(id);
      assert.strictEqual(response.body.subdomain, 'baymedicalameda');
      assert.strictEqual(response.body.message, 'Please join the Bay Medic Ambulance - Alameda Peak Response account. We’ll be using this new software to help organize and document MCIs.');

      const user = await models.User.findOne({where: {email: 'jdoe@peakresponse.net'}});
      assert(user);
      assert.strictEqual(user.firstName, 'John');
      assert.strictEqual(user.lastName, 'Doe');

      /// it should have sent out an email
      const emails = nodemailerMock.mock.getSentMail();
      assert.strictEqual(emails.length, 1);
      assert.strictEqual(emails[0].subject, 'Welcome to Peak Response');
      assert.strictEqual(emails[0].to, 'John Doe <jdoe@peakresponse.net>');

      const dAgency = await models.DemAgency.findByPk(id);
      assert(dAgency);
      assert.strictEqual(dAgency.subdomain, 'baymedicalameda');
      assert.strictEqual(dAgency.createdById, user.id);
      assert.strictEqual(dAgency.updatedById, user.id);
      assert.strictEqual(dAgency.agencyId, 'e705f64b-1399-436e-a428-18c8378b3444');
      assert.strictEqual(dAgency.createdById, user.id);
      assert.strictEqual(dAgency.updatedById, user.id);
      assert.deepStrictEqual(dAgency.data, {
        _attributes: {
          "pr:isValid": false
        },
        "dAgency.01": {
          "_text": "S01-50120"
        },
        "dAgency.02": {
          "_text": "S01-50120"
        },
        "dAgency.03": {
          "_text": "Bay Medic Ambulance - Alameda"
        },
        "dAgency.04": {
          "_text": "06"
        }
      });

      const employment = await models.Employment.findOne({where: {agencyId: dAgency.id, userId: user.id}});
      assert(employment);
      assert(employment.isOwner);
      assert.strictEqual(employment.firstName, user.firstName);
      assert.strictEqual(employment.lastName, user.lastName);
      assert.strictEqual(employment.email, user.email);

      /// the new user should also be logged in at this point
      response = await testSession.get('/api/users/me')
        .set('Host', `baymedicalameda.${process.env.BASE_HOST}`)
        .expect(HttpStatus.OK)
        assert.strictEqual(response.body.id, user.id);
    });
  });
});
