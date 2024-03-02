const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');

describe('/api/employments', () => {
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
      'regions',
      'agencies',
      'versions',
      'employments',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(StatusCodes.OK);
  });

  describe('GET /', () => {
    it('returns personnel Employment records', async () => {
      const response = await testSession.get('/api/employments').set('Host', `bmacc.${process.env.BASE_HOST}`).expect(StatusCodes.OK);
      assert.deepStrictEqual(response.body?.length, 6);
    });

    it('returns pending personnel Employment records', async () => {
      const response = await testSession
        .get('/api/employments')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .query({ isPending: 1 })
        .expect(StatusCodes.OK);
      assert.deepStrictEqual(response.body?.length, 1);
      assert(response.body[0].isPending);
    });

    it('returns non-pending personnel Employment records', async () => {
      const response = await testSession
        .get('/api/employments')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .query({ isPending: 0 })
        .expect(StatusCodes.OK);
      assert.deepStrictEqual(response.body?.length, 4);
    });
  });

  describe('POST /:id/approve', () => {
    it('approves a pending Employment record', async () => {
      const record = await models.Employment.scope('finalOrNew').findByPk('0544b426-2969-4f98-a458-e090cd3487e2');
      assert(record.isPending);
      assert.deepStrictEqual(record.approvedAt, null);
      assert.deepStrictEqual(record.approvedById, null);
      await testSession
        .post('/api/employments/0544b426-2969-4f98-a458-e090cd3487e2/approve')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(StatusCodes.OK);
      await record.reload();
      assert(!record.isPending);
      assert(record.approvedAt);
      assert.deepStrictEqual(record.approvedById, 'ffc7a312-50ba-475f-b10f-76ce793dc62a');
    });
  });

  describe('POST /:id/refuse', () => {
    it('refuses a pending Employment record', async () => {
      const record = await models.Employment.scope('finalOrNew').findByPk('0544b426-2969-4f98-a458-e090cd3487e2');
      assert(record.isPending);
      assert.deepStrictEqual(record.refusedAt, null);
      assert.deepStrictEqual(record.refusedById, null);
      await testSession
        .post('/api/employments/0544b426-2969-4f98-a458-e090cd3487e2/refuse')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(StatusCodes.OK);
      await record.reload();
      assert(!record.isPending);
      assert(record.refusedAt);
      assert.deepStrictEqual(record.refusedById, 'ffc7a312-50ba-475f-b10f-76ce793dc62a');
    });
  });
});
