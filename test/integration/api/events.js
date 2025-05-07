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
      const payload = response.body;
      assert.deepStrictEqual(payload?.Event.length, 1);
      assert.deepStrictEqual(payload?.Venue.length, 1);
      assert.deepStrictEqual(payload?.City.length, 1);
      assert.deepStrictEqual(payload?.State.length, 1);
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
      assert.deepStrictEqual(response.body.Facility, []);
      assert.deepStrictEqual(response.body.City, {
        censusClassCode: 'C1',
        censusCode: '67000',
        countyName: 'San Francisco',
        countyNumeric: '075',
        countySequence: '1',
        createdAt: '2020-04-07T19:59:21.446Z',
        dateCreated: '03/11/2008',
        dateEdited: '03/24/2019',
        featureClass: 'Civil',
        featureName: 'City of San Francisco',
        geog: {
          coordinates: [-122.4424955, 37.7782251],
          crs: {
            properties: {
              name: 'EPSG:4326',
            },
            type: 'name',
          },
          type: 'Point',
        },
        gsaCode: '',
        id: '2411786',
        opmCode: '',
        primaryLatitude: '37.7782251',
        primaryLongitude: '-122.4424955',
        stateAlpha: 'CA',
        stateNumeric: '06',
        updatedAt: response.body.City.updatedAt,
      });
      assert.deepStrictEqual(response.body.County, null);
      assert.deepStrictEqual(response.body.State, {
        abbr: 'CA',
        borderStates: [],
        createdAt: '2020-04-06T21:21:25.531Z',
        id: '06',
        isConfigured: false,
        name: 'California',
        updatedAt: response.body.State.updatedAt,
      });
      assert.deepStrictEqual(response.body.Venue, {
        address1: '99 Grove St.',
        address2: null,
        archivedAt: null,
        cityId: '2411786',
        countyId: null,
        createdAt: '2021-07-21T22:23:56.159Z',
        createdByAgencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
        createdById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
        id: 'c99fba71-91bf-4a1a-80f8-89123c324687',
        name: 'Bill Graham Civic Auditorium',
        regionId: null,
        stateId: '06',
        type: 'Y92.25',
        updatedAt: response.body.Venue.updatedAt,
        updatedById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
        zipCode: '94102',
        facilityIds: [],
      });
      assert.deepStrictEqual(response.body.Event, {
        archivedAt: null,
        createdAt: '2021-07-21T22:23:56.159Z',
        createdByAgencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
        createdById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
        description: 'A test concert event',
        endTime: '2023-10-01T23:00:00.000Z',
        id: 'e47067f1-513e-48a6-8ff9-59e57b6cb5d0',
        name: 'Test Concert',
        startTime: '2023-10-01T20:00:00.000Z',
        updatedAt: response.body.Event.updatedAt,
        updatedById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
        venueId: 'c99fba71-91bf-4a1a-80f8-89123c324687',
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
