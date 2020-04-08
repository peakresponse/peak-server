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
    await testSession.post('/login')
      .send({email: 'johndoe@test.com', password: 'abcd1234'})
      .expect(200)
  });

  describe('GET /', function() {
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
});
