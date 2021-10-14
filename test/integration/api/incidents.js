const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');

describe('/api/incidents', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'states',
      'counties',
      'cities',
      'users',
      'agencies',
      'employments',
      'psaps',
      'dispatchers',
      'scenes',
      'incidents',
      'vehicles',
      'dispatches',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(HttpStatus.OK);
  });

  describe('GET /', () => {
    it('returns a paginated list of records', async () => {
      const response = await testSession
        .get('/api/incidents')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(HttpStatus.OK)
        .expect('X-Total-Count', '1');
      assert.deepStrictEqual(response.body.length, 1);
    });
  });
});
