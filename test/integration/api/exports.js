const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');

const app = require('../../../app');
const models = require('../../../models');

describe('/api/exports', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'states',
      'counties',
      'cities',
      'users',
      'psaps',
      'nemsisStateDataSets',
      'nemsisSchematrons',
      'regions',
      'agencies',
      'versions',
      'employments',
      'exports',
    ]);
    testSession = session(app);
    await testSession.post('/login').send({ email: 'admin@peakresponse.net', password: 'abcd1234' }).expect(StatusCodes.OK);
  });

  describe('GET /', () => {
    it('returns all visible Exports', async () => {
      const response = await testSession.get('/api/exports').expect(StatusCodes.OK);
      const data = response.body;
      assert(data);
      assert.deepStrictEqual(data.length, 1);
      assert.deepStrictEqual(data[0].name, 'Export Fixture 2 (visible)');
    });

    it('returns all Exports', async () => {
      const response = await testSession.get('/api/exports?showAll=true').expect(StatusCodes.OK);
      const data = response.body;
      assert(data);
      assert.deepStrictEqual(data.length, 3);
    });
  });

  describe('POST /', () => {
    it('creates a new Export record', async () => {
      const response = await testSession
        .post('/api/exports')
        .send({
          name: 'Test Export',
          type: 'NEMSIS',
          apiUrl: 'https://validator.nemsis.org/',
          username: 'tester',
          password: 'abcd1234',
          isVisible: true,
          isApprovalReqd: false,
          isOverridable: true,
        })
        .expect(StatusCodes.CREATED);
      assert(response.body.id);
      const record = await models.Export.findByPk(response.body.id);
      assert.deepStrictEqual(record.name, 'Test Export');
      assert.deepStrictEqual(record.type, 'NEMSIS');
      assert.deepStrictEqual(record.apiUrl, 'https://validator.nemsis.org/');
      assert.deepStrictEqual(record.username, 'tester');
      assert.deepStrictEqual(record.password, 'abcd1234');
      assert.deepStrictEqual(record.isVisible, true);
      assert.deepStrictEqual(record.isApprovalReqd, false);
      assert.deepStrictEqual(record.isOverridable, true);
      assert.deepStrictEqual(record.createdById, '7f666fe4-dbdd-4c7f-ab44-d9157379a680');
      assert.deepStrictEqual(record.updatedById, '7f666fe4-dbdd-4c7f-ab44-d9157379a680');
    });
  });

  describe('PATCH /:id', () => {
    it('updates an existing Export record', async () => {
      const response = await testSession
        .patch('/api/exports/d897bfb5-c286-400e-9fa8-582cfef7791c')
        .send({
          name: 'Export Fixture 3 (now visible)',
          isVisible: true,
        })
        .expect(StatusCodes.OK);
      assert.deepStrictEqual(response.body.id, 'd897bfb5-c286-400e-9fa8-582cfef7791c');
      assert.deepStrictEqual(response.body.name, 'Export Fixture 3 (now visible)');
      assert.deepStrictEqual(response.body.isVisible, true);

      const record = await models.Export.findByPk('d897bfb5-c286-400e-9fa8-582cfef7791c');
      assert.deepStrictEqual(record.name, 'Export Fixture 3 (now visible)');
      assert.deepStrictEqual(record.isVisible, true);
    });
  });

  describe('DELETE /:id', () => {
    it('deletes an existing Export record', async () => {
      await testSession.delete('/api/exports/d897bfb5-c286-400e-9fa8-582cfef7791c').expect(StatusCodes.OK);
      const record = await models.Export.findByPk('d897bfb5-c286-400e-9fa8-582cfef7791c');
      assert.deepStrictEqual(record, null);
    });
  });
});
