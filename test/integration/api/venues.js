const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');

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
    });
  });

  describe('PATCH /:id', () => {
    it('updates an existing Venue record', async () => {
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
        cityId: '2411786',
        countyId: null,
        createdAt: response.body.createdAt,
        createdByAgencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
        createdById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
        id: 'c99fba71-91bf-4a1a-80f8-89123c324687',
        name: 'Bill Graham Civic Auditorium',
        regionId: null,
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
      await testSession
        .delete('/api/venues/c99fba71-91bf-4a1a-80f8-89123c324687')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(StatusCodes.OK);
      const record = await models.Venue.findByPk('c99fba71-91bf-4a1a-80f8-89123c324687');
      assert.ok(record.archivedAt);
    });
  });
});
