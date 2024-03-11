const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');

const app = require('../../../app');
const models = require('../../../models');

describe('/api/regions', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'states',
      'counties',
      'cities',
      'psaps',
      'users',
      'nemsisStateDataSets',
      'nemsisSchematrons',
      'regions',
      'agencies',
      'versions',
      'facilities',
      'regionAgencies',
      'regionFacilities',
    ]);
    testSession = session(app);
    await testSession.post('/login').send({ email: 'admin@peakresponse.net', password: 'abcd1234' }).expect(StatusCodes.OK);
  });

  describe('GET /', () => {
    it('returns all Regions', async () => {
      const response = await testSession.get('/api/regions').expect(StatusCodes.OK);
      const data = response.body;
      assert(data);
      assert.deepStrictEqual(data.length, 3);
      assert.deepStrictEqual(data[0].name, 'Central California EMS Agency');
      assert.deepStrictEqual(data[1].name, 'Contra Costa EMS Agency');
      assert.deepStrictEqual(data[2].name, 'San Francisco County EMS Agency');
    });
  });

  describe('GET /:id', () => {
    it('returns a Region by id', async () => {
      const response = await testSession.get('/api/regions/c781fe1e-a337-4cc3-9351-5aed61fa3c0d').expect(StatusCodes.OK);
      const data = response.body;
      assert(data);
      assert.deepStrictEqual(data, {
        id: 'c781fe1e-a337-4cc3-9351-5aed61fa3c0d',
        name: 'San Francisco County EMS Agency',
        regionAgencies: data.regionAgencies,
        regionFacilities: data.regionFacilities,
        createdById: '7f666fe4-dbdd-4c7f-ab44-d9157379a680',
        updatedById: '7f666fe4-dbdd-4c7f-ab44-d9157379a680',
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
      assert.deepStrictEqual(data.regionAgencies.length, 3);
      assert.deepStrictEqual(data.regionAgencies[0].agency.name, 'San Francisco Fire Department');
      assert.deepStrictEqual(data.regionAgencies[1].agency.name, 'Bay Medic Ambulance - Alameda');
      assert.deepStrictEqual(data.regionAgencies[2].agency.name, 'Bayshore Ambulance');
      assert.deepStrictEqual(data.regionFacilities.length, 3);
      assert.deepStrictEqual(data.regionFacilities[0].facility.name, 'Zuckerberg San Francisco General Hospital and Trauma Center');
      assert.deepStrictEqual(data.regionFacilities[1].facility.name, 'Saint Francis Memorial Hospital');
      assert.deepStrictEqual(data.regionFacilities[2].facility.name, 'CPMC-Van Ness');
    });
  });

  describe('POST /', () => {
    it('creates a new Region record', async () => {
      const response = await testSession
        .post('/api/regions')
        .send({
          name: 'Sacramento County EMS Agency',
        })
        .expect(StatusCodes.CREATED);
      assert(response.body.id);
      const record = await models.Region.findByPk(response.body.id);
      assert.deepStrictEqual(record.name, 'Sacramento County EMS Agency');
      assert.deepStrictEqual(record.createdById, '7f666fe4-dbdd-4c7f-ab44-d9157379a680');
      assert.deepStrictEqual(record.updatedById, '7f666fe4-dbdd-4c7f-ab44-d9157379a680');
    });
  });

  describe('PATCH /:id', () => {
    it('updates an existing Region record', async () => {
      const response = await testSession
        .patch('/api/regions/c781fe1e-a337-4cc3-9351-5aed61fa3c0d')
        .send({
          name: 'City and County of San Francisco EMS Agency',
        })
        .expect(StatusCodes.OK);
      assert.deepStrictEqual(response.body.id, 'c781fe1e-a337-4cc3-9351-5aed61fa3c0d');
      assert.deepStrictEqual(response.body.name, 'City and County of San Francisco EMS Agency');

      const record = await models.Region.findByPk('c781fe1e-a337-4cc3-9351-5aed61fa3c0d');
      assert.deepStrictEqual(record.name, 'City and County of San Francisco EMS Agency');
    });
  });

  describe('DELETE /:id', () => {
    it('deletes an existing Region record', async () => {
      await testSession.delete('/api/regions/3c438edf-c509-4f13-b2c7-12910eda2b6c').expect(StatusCodes.OK);
      const record = await models.Region.findByPk('3c438edf-c509-4f13-b2c7-12910eda2b6c');
      assert.deepStrictEqual(record, null);
    });
  });
});
