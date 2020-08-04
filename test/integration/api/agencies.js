'use strict'

const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');

describe('/api/agencies', function() {
  let testSession;

  beforeEach(async function() {
    await helpers.loadFixtures(['states', 'agencies', 'users']);
    testSession = session(app);
  });

  describe('GET /', function() {
    beforeEach(async function() {
      await testSession.post('/login')
        .send({email: 'admin@peakresponse.net', password: 'abcd1234'})
        .expect(200)
    });

    it('returns a paginated list of Agency records', async function() {
      const response = await testSession.get('/api/agencies/')
        .expect(200)
        .expect('X-Total-Count', '11')
        .expect('Link', '')
      assert.equal(response.body.length, 11);
    });

    it('returns a paginated list of search filtered Agency records', async function() {
      const response = await testSession.get('/api/agencies/')
        .query({search: 'fire'})
        .expect(200)
        .expect('X-Total-Count', '4')
        .expect('Link', '')
      assert.equal(response.body.length, 4);
      assert.equal(response.body[0].name, 'Bodega Bay Fire Protection District');
      for (let facility of response.body) {
        assert(facility.name.match(/fire/i));
      }
    });
  });

  describe('GET /me', function() {
    beforeEach(async function() {
      await helpers.loadFixtures(['demographics/dem-agencies', 'demographics/employments'])
      await testSession.post('/login')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({email: 'regular@peakresponse.net', password: 'abcd1234'})
        .expect(HttpStatus.OK)
    });

    it('returns the demographic Agency record for the current subdomain', async function() {
      const response = await testSession.get('/api/agencies/me')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(HttpStatus.OK);
      assert.strictEqual(response.body.subdomain, 'bmacc');
    });

    it('returns not found when called on the naked domain', async function() {
      const response = await testSession.get('/api/agencies/me')
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
