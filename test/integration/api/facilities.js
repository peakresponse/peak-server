'use strict'

const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');

describe('/api/facilities', function() {
  let testSession;

  beforeEach(async function() {
    await helpers.loadFixtures(['facilities', 'users']);
    testSession = session(app);
    await testSession.post('/login')
      .send({email: 'johndoe@test.com', password: 'abcd1234'})
      .expect(200)
  });

  describe('GET /', function() {
    it('returns a paginated list of Facility records', async function() {
      const response = await testSession.get('/api/facilities/')
        .expect(200)
        .expect('X-Total-Count', '216')
        .expect('Link', '<http://localhost:3000/api/facilities/?page=2>; rel="next",<http://localhost:3000/api/facilities/?page=9>; rel="last"')
      assert.equal(response.body.length, 25);
    });

    it('returns a paginated list of Facility records with the given type', async function() {
      const response = await testSession.get('/api/facilities/')
        .query({type: '1701005'})
        .expect(200)
        .expect('X-Total-Count', '41')
        .expect('Link', '<http://localhost:3000/api/facilities/?type=1701005&page=2>; rel="next"')
      assert.equal(response.body.length, 25);
    });

    it('returns a paginated list of Facility records near the lat/lng', async function() {
      const response = await testSession.get('/api/facilities/')
        .query({lat: '37.7873437', lng: '-122.4536086'})
        .expect(200)
        .expect('X-Total-Count', '216')
        .expect('Link', '<http://localhost:3000/api/facilities/?lat=37.7873437&lng=-122.4536086&page=2>; rel="next",<http://localhost:3000/api/facilities/?lat=37.7873437&lng=-122.4536086&page=9>; rel="last"')
      assert.equal(response.body.length, 25);
      assert.equal(response.body[0].name, 'CPMC - 3801 Sacramento Street');
    });

    it('returns a paginated list of search filtered Facility records near the lat/lng', async function() {
      const response = await testSession.get('/api/facilities/')
        .query({lat: '37.7873437', lng: '-122.4536086'})
        .query({search: 'cpmc'})
        .expect(200)
        .expect('X-Total-Count', '7')
        .expect('Link', '')
      assert.equal(response.body.length, 7);
      assert.equal(response.body[0].name, 'CPMC - 3801 Sacramento Street');
      for (let facility of response.body) {
        assert(facility.name.match(/cpmc/i));
      }
    });
  });
});
