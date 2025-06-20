const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');

const { mockRouted } = require('../../mocks/routed');

describe('/api/venues', () => {
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
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(StatusCodes.OK);
  });

  describe('GET /', () => {
    it('returns a list of Venues for the Agency', async () => {
      const response = await testSession.get('/api/venues').set('Host', `bmacc.${process.env.BASE_HOST}`).expect(StatusCodes.OK);
      const records = response.body;
      assert.deepStrictEqual(records?.Venue.length, 1);
    });
  });

  describe('POST /', () => {
    it('creates a new Venue for the Agency', async () => {
      mockRouted();
      const response = await testSession
        .post('/api/venues')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          name: 'Chase Center',
          type: 'Y92.3',
          address1: '1 Warriors Way',
          cityId: '2411786',
          stateId: '06',
          zipCode: '94158',
          regionId: 'c781fe1e-a337-4cc3-9351-5aed61fa3c0d',
        })
        .expect(StatusCodes.CREATED);

      assert(response.body?.id);
      const record = await models.Venue.findByPk(response.body.id);
      assert.deepStrictEqual(record.name, 'Chase Center');
      assert.deepStrictEqual(record.type, 'Y92.3');
      assert.deepStrictEqual(record.address1, '1 Warriors Way');
      assert.deepStrictEqual(record.cityId, '2411786');
      assert.deepStrictEqual(record.stateId, '06');
      assert.deepStrictEqual(record.zipCode, '94158');
      assert.deepStrictEqual(record.regionId, 'c781fe1e-a337-4cc3-9351-5aed61fa3c0d');
    });
  });

  describe('PATCH /:id', () => {
    it('updates an existing Venue record', async () => {
      mockRouted();
      await testSession
        .patch('/api/venues/c99fba71-91bf-4a1a-80f8-89123c324687')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          name: 'San Francisco Civic Auditorium',
          type: 'Y92.252',
          address1: '99 Grove Street',
          address2: 'Test',
          zipCode: '94103',
        })
        .expect(StatusCodes.OK);

      const record = await models.Venue.findByPk('c99fba71-91bf-4a1a-80f8-89123c324687');
      assert.deepStrictEqual(record.name, 'San Francisco Civic Auditorium');
      assert.deepStrictEqual(record.type, 'Y92.252');
      assert.deepStrictEqual(record.address1, '99 Grove Street');
      assert.deepStrictEqual(record.address2, 'Test');
      assert.deepStrictEqual(record.zipCode, '94103');
    });
  });

  describe('GET /:id', () => {
    it('returns the specified Venue', async () => {
      const response = await testSession
        .get('/api/venues/c99fba71-91bf-4a1a-80f8-89123c324687')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(StatusCodes.OK);
      assert.deepStrictEqual(response.body, {
        address1: '99 Grove St.',
        address2: null,
        archivedAt: null,
        city: response.body.city,
        cityId: '2411786',
        county: null,
        countyId: null,
        createdAt: response.body.createdAt,
        createdByAgencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
        createdById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
        facilities: [],
        facilityIds: [],
        id: 'c99fba71-91bf-4a1a-80f8-89123c324687',
        name: 'Bill Graham Civic Auditorium',
        region: {
          createdAt: '2020-10-06T01:44:44.012Z',
          createdById: '7f666fe4-dbdd-4c7f-ab44-d9157379a680',
          id: 'c781fe1e-a337-4cc3-9351-5aed61fa3c0d',
          name: 'San Francisco County EMS Agency',
          routedClientId: 'testid',
          routedUrl: 'https://sf.routedapp.net',
          updatedAt: response.body.region.updatedAt,
          updatedById: '7f666fe4-dbdd-4c7f-ab44-d9157379a680',
        },
        regionId: 'c781fe1e-a337-4cc3-9351-5aed61fa3c0d',
        state: response.body.state,
        stateId: '06',
        type: 'Y92.25',
        updatedAt: response.body.updatedAt,
        updatedById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
        zipCode: '94102',
      });
    });
  });

  describe('DELETE /:id', () => {
    it('marks as archived the specified Venue', async () => {
      mockRouted();
      await testSession
        .delete('/api/venues/c99fba71-91bf-4a1a-80f8-89123c324687')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(StatusCodes.OK);
      const record = await models.Venue.findByPk('c99fba71-91bf-4a1a-80f8-89123c324687');
      assert.ok(record.archivedAt);
    });
  });
});
