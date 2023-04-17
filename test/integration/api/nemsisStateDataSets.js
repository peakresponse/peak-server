const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');

const app = require('../../../app');
const models = require('../../../models');

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

  describe('POST /', () => {
    it('creates a new Nemsis State Data Set record', async () => {
      const response = await testSession
        .post('/api/nemsis/state-data-sets')
        .send({ stateId: '50', version: '2023-02-21-001db2f318b31b46da54fb8891e195df6bb8947c' })
        .expect(HttpStatus.CREATED);
      assert(response.body.id);
      const record = await models.NemsisStateDataSet.findByPk(response.body.id);
      assert.deepStrictEqual(record.stateId, '50');
      assert.deepStrictEqual(record.nemsisVersion, '3.5.0.191130CP1');
      assert.deepStrictEqual(record.version, '2023-02-21-001db2f318b31b46da54fb8891e195df6bb8947c');
      assert.deepStrictEqual(record.createdById, '7f666fe4-dbdd-4c7f-ab44-d9157379a680');
      assert.deepStrictEqual(record.updatedById, '7f666fe4-dbdd-4c7f-ab44-d9157379a680');
    });
  });
});
