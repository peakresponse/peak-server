const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');

const app = require('../../../app');

describe('/api/nemsis/state-data-sets', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'states',
      'counties',
      'cities',
      'users',
      'psaps',
      'nemsisStateDataSets',
      'agencies',
      'versions',
      'employments',
    ]);
    testSession = session(app);
    await testSession.post('/login').send({ email: 'admin@peakresponse.net', password: 'abcd1234' }).expect(HttpStatus.OK);
  });

  describe('GET /', () => {
    it('returns all configured NEMSIS state data sets', async () => {
      const response = await testSession.get('/api/nemsis/state-data-sets').expect(HttpStatus.OK);
      const data = response.body;
      assert(data);
      assert.deepStrictEqual(data.length, 2);
      assert.deepStrictEqual(data[0].stateId, '06');
      assert.deepStrictEqual(data[1].stateId, '50');
    });

    it('returns configured NEMSIS state data sets for the given state', async () => {
      const response = await testSession.get('/api/nemsis/state-data-sets?stateId=50').expect(HttpStatus.OK);
      const data = response.body;
      assert(data);
      assert.deepStrictEqual(data.length, 1);
      assert.deepStrictEqual(data[0].stateId, '50');
    });
  });
});
