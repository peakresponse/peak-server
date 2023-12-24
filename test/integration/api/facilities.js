const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');

describe('/api/facilities', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures(['cities', 'counties', 'states', 'users', 'facilities']);
    testSession = session(app);
    await testSession.post('/login').send({ email: 'admin@peakresponse.net', password: 'abcd1234' }).expect(HttpStatus.OK);
  });

  describe('GET /', () => {
    it('returns a paginated list of Facility records', async () => {
      const response = await testSession
        .get('/api/facilities/')
        .expect(HttpStatus.OK)
        .expect('X-Total-Count', '127')
        .expect(
          'Link',
          `<${process.env.BASE_URL}/api/facilities/?page=2>; rel="next",<${process.env.BASE_URL}/api/facilities/?page=6>; rel="last"`,
        );
      assert.deepStrictEqual(response.body.length, 25);
    });

    it('returns a paginated list of Facility records with the given type', async () => {
      const response = await testSession
        .get('/api/facilities/')
        .query({ type: '1701005' })
        .expect(HttpStatus.OK)
        .expect('X-Total-Count', '16');
      assert.deepStrictEqual(response.body.length, 16);
    });

    it('returns a paginated list of Facility records near the lat/lng', async () => {
      const response = await testSession
        .get('/api/facilities/')
        .query({ lat: '37.7866029', lng: '-122.4560444' })
        .expect(HttpStatus.OK)
        .expect('X-Total-Count', '127')
        .expect(
          'Link',
          `<${process.env.BASE_URL}/api/facilities/?lat=37.7866029&lng=-122.4560444&page=2>; rel="next",<${process.env.BASE_URL}/api/facilities/?lat=37.7866029&lng=-122.4560444&page=6>; rel="last"`,
        );
      assert.deepStrictEqual(response.body.length, 25);
      assert.deepStrictEqual(response.body[0].name, 'CPMC - 3801 Sacramento Street');
    });

    it('returns a paginated list of search filtered Facility records near the lat/lng', async () => {
      const response = await testSession
        .get('/api/facilities/')
        .query({ lat: '37.7866029', lng: '-122.4560444' })
        .query({ search: 'cpmc' })
        .expect(HttpStatus.OK)
        .expect('X-Total-Count', '8')
        .expect('Link', '');
      assert.deepStrictEqual(response.body.length, 8);
      assert.deepStrictEqual(response.body[0].name, 'CPMC - 3801 Sacramento Street');
      for (const facility of response.body) {
        assert(facility.name.match(/cpmc/i));
      }
    });
  });

  describe('POST /fetch', () => {
    it('returns a list of matching Facilities', async () => {
      const response = await testSession
        .post('/api/facilities/fetch')
        .set('Accept', 'application/json')
        .send({
          '06': ['20386', '62636'],
        })
        .expect(HttpStatus.OK);
      const facilities = response.body;
      facilities.sort((a, b) => a.name.localeCompare(b.name));
      assert.deepStrictEqual(facilities.length, 2);
      assert.deepStrictEqual(facilities[0].name, 'CPMC-Van Ness');
      assert.deepStrictEqual(facilities[1].name, 'Zuckerberg San Francisco General Hospital and Trauma Center');
    });
  });
});
