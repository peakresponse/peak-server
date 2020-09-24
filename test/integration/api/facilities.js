const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');

// eslint-disable-next-line func-names
describe('/api/facilities', function () {
  this.timeout(10000);

  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures(['states', 'facilities', 'users']);
    testSession = session(app);
    await testSession
      .post('/login')
      .send({ email: 'admin@peakresponse.net', password: 'abcd1234' })
      .expect(HttpStatus.OK);
  });

  describe('GET /', () => {
    it('returns a paginated list of Facility records', async () => {
      const response = await testSession
        .get('/api/facilities/')
        .expect(HttpStatus.OK)
        .expect('X-Total-Count', '103')
        .expect(
          'Link',
          '<http://lvh.me:3000/api/facilities/?page=2>; rel="next",<http://lvh.me:3000/api/facilities/?page=5>; rel="last"'
        );
      assert.deepStrictEqual(response.body.length, 25);
    });

    it('returns a paginated list of Facility records with the given type', async () => {
      const response = await testSession
        .get('/api/facilities/')
        .query({ type: '1701005' })
        .expect(HttpStatus.OK)
        .expect('X-Total-Count', '9');
      assert.deepStrictEqual(response.body.length, 9);
    });

    it('returns a paginated list of Facility records near the lat/lng', async () => {
      const response = await testSession
        .get('/api/facilities/')
        .query({ lat: '37.7873437', lng: '-122.4536086' })
        .expect(HttpStatus.OK)
        .expect('X-Total-Count', '103')
        .expect(
          'Link',
          '<http://lvh.me:3000/api/facilities/?lat=37.7873437&lng=-122.4536086&page=2>; rel="next",<http://lvh.me:3000/api/facilities/?lat=37.7873437&lng=-122.4536086&page=5>; rel="last"'
        );
      assert.deepStrictEqual(response.body.length, 25);
      assert.deepStrictEqual(
        response.body[0].name,
        'CPMC - 3801 Sacramento Street'
      );
    });

    it('returns a paginated list of search filtered Facility records near the lat/lng', async () => {
      const response = await testSession
        .get('/api/facilities/')
        .query({ lat: '37.7873437', lng: '-122.4536086' })
        .query({ search: 'cpmc' })
        .expect(HttpStatus.OK)
        .expect('X-Total-Count', '7')
        .expect('Link', '');
      assert.deepStrictEqual(response.body.length, 7);
      assert.deepStrictEqual(
        response.body[0].name,
        'CPMC - 3801 Sacramento Street'
      );
      for (const facility of response.body) {
        assert(facility.name.match(/cpmc/i));
      }
    });
  });
});
