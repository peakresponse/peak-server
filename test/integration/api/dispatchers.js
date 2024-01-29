const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');

describe('/api/psaps', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'users',
      'states',
      'counties',
      'cities',
      'psaps',
      'dispatchers',
      'nemsisStateDataSets',
      'nemsisSchematrons',
      'agencies',
      'versions',
      'employments',
    ]);
    testSession = session(app);
    await testSession.post('/login').send({ email: 'admin@peakresponse.net', password: 'abcd1234' }).expect(StatusCodes.OK);
  });

  describe('GET /', () => {
    it('returns a paginated list of records', async () => {
      const response = await testSession.get('/api/dispatchers?psapId=588').expect(StatusCodes.OK).expect('X-Total-Count', '1');
      assert.deepStrictEqual(response.body.length, 1);
    });
  });

  describe('POST /', () => {
    it('creates a new record', async () => {
      const response = await testSession
        .post('/api/dispatchers')
        .send({
          psapId: '588',
          userId: '9eb5be23-c098-495c-a758-ce1def3ff541',
          callSign: 'TEST',
        })
        .expect(StatusCodes.CREATED);

      const record = await models.Dispatcher.findByPk(response.body.id);
      assert(record);
      assert.deepStrictEqual(record.psapId, '588');
      assert.deepStrictEqual(record.userId, '9eb5be23-c098-495c-a758-ce1def3ff541');
      assert.deepStrictEqual(record.callSign, 'TEST');
    });
  });

  describe('GET /:id', () => {
    it('returns a record by id', async () => {
      const response = await testSession.get('/api/dispatchers/1f8a2ee2-8b6a-43b6-8764-a6013643a24b').expect(StatusCodes.OK);
      assert.deepStrictEqual(response.body.callSign, 'DT01');
    });
  });

  describe('PATCH /:id', () => {
    it('updates a record by id', async () => {
      await testSession
        .patch('/api/dispatchers/1f8a2ee2-8b6a-43b6-8764-a6013643a24b')
        .send({
          callSign: 'TESTING',
        })
        .expect(StatusCodes.OK);
      const record = await models.Dispatcher.findByPk('1f8a2ee2-8b6a-43b6-8764-a6013643a24b');
      assert.deepStrictEqual(record.callSign, 'TESTING');
    });
  });
});
