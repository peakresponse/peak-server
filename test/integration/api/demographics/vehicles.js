const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../../helpers');
const app = require('../../../../app');
const models = require('../../../../models');

describe('/api/demographics/vehicles', () => {
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
      'agencies',
      'versions',
      'employments',
      'vehicles',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(200);
  });

  describe('GET /', () => {
    it('returns a list of Vehicles', async () => {
      const response = await testSession
        .get('/api/demographics/vehicles')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(StatusCodes.OK);
      const vehicles = response.body;
      assert.deepStrictEqual(vehicles.length, 4);
      assert.deepStrictEqual(vehicles[0].data['dVehicle.01']._text, '43');
      assert.deepStrictEqual(vehicles[1].data['dVehicle.01']._text, '50');
      assert(vehicles[1].draft);
      assert.deepStrictEqual(vehicles[2].data['dVehicle.01']._text, '88');
      assert.deepStrictEqual(vehicles[3].data['dVehicle.01']._text, '92');
      assert(vehicles[3].isDraft);
    });
  });

  describe('POST /', () => {
    it('creates a draft of a brand new Vehicle record', async () => {
      const response = await testSession
        .post('/api/demographics/vehicles')
        .send({
          data: {
            'dVehicle.01': { _text: '62' },
            'dVehicle.02': { _text: '5XYKTDA60CG246250' },
            'dVehicle.03': { _text: '62' },
            'dVehicle.04': { _text: '1404001' },
          },
        })
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(StatusCodes.CREATED);

      function assertVehicle(vehicle) {
        assert(vehicle.id);
        assert(vehicle.id === vehicle.data._attributes.UUID);
        assert(vehicle.isDraft);
        assert(vehicle.isValid);
        assert.deepStrictEqual(vehicle.validationErrors, null);
        assert.deepStrictEqual(vehicle.data, {
          _attributes: { UUID: vehicle.id },
          'dVehicle.01': { _text: '62' },
          'dVehicle.02': { _text: '5XYKTDA60CG246250' },
          'dVehicle.03': { _text: '62' },
          'dVehicle.04': { _text: '1404001' },
        });
      }
      assertVehicle(response.body);
      assertVehicle(await models.Vehicle.findByPk(response.body.id));
    });
  });

  describe('GET /:id', () => {
    it('returns the specified Vehicle record, including its draft if any', async () => {
      const response = await testSession
        .get(`/api/demographics/vehicles/91986460-5a12-426d-9855-93227b47ead5`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(StatusCodes.OK);
      assert.deepStrictEqual(response.body.data, {
        _attributes: {
          UUID: '91986460-5a12-426d-9855-93227b47ead5',
        },
        'dVehicle.01': {
          _text: '50',
        },
        'dVehicle.02': {
          _text: 'JH4DA9380PS016488',
        },
        'dVehicle.03': {
          _text: '50',
        },
        'dVehicle.04': {
          _text: '1404001',
        },
      });
      assert.deepStrictEqual(response.body.draft?.data, {
        _attributes: {
          UUID: '91986460-5a12-426d-9855-93227b47ead5',
        },
        'dVehicle.01': {
          _text: '55',
        },
        'dVehicle.02': {
          _text: 'JH4DA9380PS016488',
        },
        'dVehicle.03': {
          _text: '55',
        },
        'dVehicle.04': {
          _text: '1404001',
        },
      });
    });
  });

  describe('PUT /:id', () => {
    it('creates a new draft edit of an existing Vehicle record', async () => {
      const data = {
        _attributes: {
          UUID: '4d71fd4a-ef2b-4a0c-aa11-214b5f54f8f7',
        },
        'dVehicle.01': {
          _text: '8888',
        },
        'dVehicle.02': {
          _text: 'JM1FE173540138012',
        },
        'dVehicle.03': {
          _text: '8888',
        },
        'dVehicle.04': {
          _text: '1404001',
        },
      };
      const response = await testSession
        .put(`/api/demographics/vehicles/4d71fd4a-ef2b-4a0c-aa11-214b5f54f8f7`)
        .send({ data })
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(StatusCodes.OK);
      assert.deepStrictEqual(response.body.data, data);

      const vehicle = await models.Vehicle.findByPk('4d71fd4a-ef2b-4a0c-aa11-214b5f54f8f7');
      const draft = await vehicle.getDraft();
      assert(draft);
      assert(draft.isValid);
      assert.deepStrictEqual(draft.data, data);
    });
  });

  describe('DELETE /:id', () => {
    it('deletes the draft Vehicle record from the specified parent', async () => {
      await testSession
        .delete(`/api/demographics/vehicles/91986460-5a12-426d-9855-93227b47ead5`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(StatusCodes.NO_CONTENT);
      const record = await models.Vehicle.findByPk('91986460-5a12-426d-9855-93227b47ead5');
      const draft = await record.getDraft();
      assert.deepStrictEqual(draft, null);
    });

    it('deletes the specified draft Vehicle record', async () => {
      await testSession
        .delete(`/api/demographics/vehicles/3465c833-2919-4565-8bde-a3ce70eaae8f`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(StatusCodes.NO_CONTENT);
      const record = await models.Vehicle.findByPk('91986460-5a12-426d-9855-93227b47ead5');
      const draft = await record.getDraft();
      assert.deepStrictEqual(draft, null);
    });
  });
});
