const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');

describe('/api/psaps', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'users',
      'states',
      'counties',
      'cities',
      'psaps',
      'nemsisStateDataSets',
      'nemsisSchematrons',
      'dispatchers',
      'agencies',
      'versions',
      'employments',
    ]);
    testSession = session(app);
    await testSession.post('/login').send({ email: 'admin@peakresponse.net', password: 'abcd1234' }).expect(StatusCodes.OK);
  });

  describe('GET /', () => {
    it('returns a paginated list of records', async () => {
      const response = await testSession.get('/api/psaps').expect(StatusCodes.OK).expect('X-Total-Count', '2');
      assert.deepStrictEqual(response.body.length, 2);
    });
  });

  describe('GET /:id', () => {
    it('returns a record by id', async () => {
      const response = await testSession.get('/api/psaps/588').expect(StatusCodes.OK);
      assert.deepStrictEqual(response.body.name, 'San Francisco Department Of Emergency Management (san Francisco)');
    });
  });
});
