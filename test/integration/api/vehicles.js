const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');

describe('/api/vehicles', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures(['users', 'states', 'counties', 'cities', 'psaps', 'agencies', 'employments', 'vehicles']);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(200);
  });

  describe('GET /', () => {
    it('returns a list of Vehicles for the current agency', async () => {
      const response = await testSession.get('/api/vehicles').set('Host', `bmacc.${process.env.BASE_HOST}`).expect(HttpStatus.OK);
      const records = response.body;
      assert.deepStrictEqual(records.length, 3);
      assert.deepStrictEqual(records[0].number, '43');
      assert.deepStrictEqual(records[1].number, '50');
      assert.deepStrictEqual(records[2].number, '88');
    });
  });
});
