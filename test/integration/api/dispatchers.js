const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');

describe('/api/psaps', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures(['users', 'states', 'counties', 'cities', 'psaps', 'dispatchers', 'agencies', 'employments']);
    testSession = session(app);
    await testSession.post('/login').send({ email: 'admin@peakresponse.net', password: 'abcd1234' }).expect(HttpStatus.OK);
  });

  describe('GET /', () => {
    it('returns a paginated list of records', async () => {
      const response = await testSession.get('/api/dispatchers?psapId=588').expect(HttpStatus.OK).expect('X-Total-Count', '1');
      assert.deepStrictEqual(response.body.length, 1);
    });
  });

  describe('GET /:id', () => {
    it('returns a record by id', async () => {
      const response = await testSession.get('/api/dispatchers/1f8a2ee2-8b6a-43b6-8764-a6013643a24b').expect(HttpStatus.OK);
      assert.deepStrictEqual(response.body.callSign, 'DT01');
    });
  });
});
