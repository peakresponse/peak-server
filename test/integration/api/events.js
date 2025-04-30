const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');

describe('/api/events', () => {
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
      'regions',
      'agencies',
      'versions',
      'employments',
      'venues',
      'events',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(StatusCodes.OK);
  });

  describe('GET /', () => {
    it('returns a list of Events for the Agency', async () => {
      const response = await testSession.get('/api/events').set('Host', `bmacc.${process.env.BASE_HOST}`).expect(StatusCodes.OK);
      const records = response.body;
      assert.deepStrictEqual(records?.length, 1);
    });
  });

  describe('POST /', () => {
    it('creates a new Event for the Agency', async () => {
      const response = await testSession
        .post('/api/events')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          name: 'New Event',
          description: 'New Event Description',
          startTime: '2025-10-01T00:00:00Z',
          endTime: '2025-10-02T00:00:00Z',
          venueId: 'c99fba71-91bf-4a1a-80f8-89123c324687',
        })
        .expect(StatusCodes.CREATED);

      assert(response.body?.id);
      const record = await models.Event.findByPk(response.body.id);
      assert.deepStrictEqual(record.name, 'New Event');
      assert.deepStrictEqual(record.description, 'New Event Description');
      assert.deepStrictEqual(record.startTime.toISOString(), '2025-10-01T00:00:00.000Z');
      assert.deepStrictEqual(record.endTime.toISOString(), '2025-10-02T00:00:00.000Z');
      assert.deepStrictEqual(record.venueId, 'c99fba71-91bf-4a1a-80f8-89123c324687');
    });
  });

  describe('PATCH /:id', () => {
    it('updates an existing Event record', async () => {
      await testSession
        .patch('/api/events/e47067f1-513e-48a6-8ff9-59e57b6cb5d0')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          name: 'Updated Name',
          description: 'Updated Description',
          startTime: '2025-10-01T00:00:00Z',
          endTime: '2025-10-02T00:00:00Z',
        })
        .expect(StatusCodes.OK);

      const record = await models.Event.findByPk('e47067f1-513e-48a6-8ff9-59e57b6cb5d0');
      assert.deepStrictEqual(record.name, 'Updated Name');
      assert.deepStrictEqual(record.description, 'Updated Description');
      assert.deepStrictEqual(record.startTime.toISOString(), '2025-10-01T00:00:00.000Z');
      assert.deepStrictEqual(record.endTime.toISOString(), '2025-10-02T00:00:00.000Z');
    });
  });

  describe('GET /:id', () => {
    it('returns the specified Event', async () => {
      const response = await testSession
        .get('/api/events/e47067f1-513e-48a6-8ff9-59e57b6cb5d0')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(StatusCodes.OK);
      assert.deepStrictEqual(response.body, {
        archivedAt: null,
        createdAt: response.body.createdAt,
        createdByAgencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
        createdById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
        description: 'A test concert event',
        endTime: '2023-10-01T23:00:00.000Z',
        id: 'e47067f1-513e-48a6-8ff9-59e57b6cb5d0',
        name: 'Test Concert',
        startTime: '2023-10-01T20:00:00.000Z',
        updatedAt: response.body.updatedAt,
        updatedById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
        venueId: 'c99fba71-91bf-4a1a-80f8-89123c324687',
        venue: response.body.venue,
      });
    });
  });

  describe('DELETE /:id', () => {
    it('marks as archived the specified Event', async () => {
      await testSession
        .delete('/api/events/e47067f1-513e-48a6-8ff9-59e57b6cb5d0')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(StatusCodes.OK);
      const record = await models.Event.findByPk('e47067f1-513e-48a6-8ff9-59e57b6cb5d0');
      assert.ok(record.archivedAt);
    });
  });
});
