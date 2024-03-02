const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');

describe('/api/assignments', () => {
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
      'vehicles',
      'assignments',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'personnel.admin@peakresponse.net', password: 'abcd1234' })
      .expect(StatusCodes.OK);
  });

  describe('POST /', () => {
    it('creates a new Assignment', async () => {
      const response = await testSession
        .post('/api/assignments')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          vehicleId: '91986460-5a12-426d-9855-93227b47ead5',
        })
        .expect(StatusCodes.CREATED);
      assert.deepStrictEqual(response.body.Assignment?.userId, '8e6753e2-3063-48e1-af22-cea57bd06514');
      assert.deepStrictEqual(response.body.Assignment?.vehicleId, '91986460-5a12-426d-9855-93227b47ead5');
      assert.deepStrictEqual(response.body.Vehicle?.id, '91986460-5a12-426d-9855-93227b47ead5');
    });

    it('creates a new Vehicle with Assignment', async () => {
      const response = await testSession
        .post('/api/assignments')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          number: '23',
        })
        .expect(StatusCodes.CREATED);
      assert.deepStrictEqual(response.body.Assignment?.userId, '8e6753e2-3063-48e1-af22-cea57bd06514');
      assert(response.body.Assignment?.vehicleId);
      const vehicle = await models.Vehicle.findByPk(response.body.Assignment.vehicleId, { rejectOnEmpty: true });
      assert.deepStrictEqual(vehicle.number, '23');
      assert.deepStrictEqual(vehicle.callSign, '23');
    });

    it('creates a new null Assignment', async () => {
      const response = await testSession
        .post('/api/assignments')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({})
        .expect(StatusCodes.CREATED);
      assert.deepStrictEqual(response.body.Assignment?.userId, '8e6753e2-3063-48e1-af22-cea57bd06514');
      assert.deepStrictEqual(response.body.Assignment?.vehicleId, null);
      assert.deepStrictEqual(response.body.Vehicle, undefined);
    });

    it('returns an existing Assignment if unchanged', async () => {
      const response = await testSession
        .post('/api/assignments')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          userId: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          vehicleId: '4d71fd4a-ef2b-4a0c-aa11-214b5f54f8f7',
        })
        .expect(StatusCodes.CREATED);
      assert.deepStrictEqual(response.body.Assignment?.id, 'e5b169aa-e0a6-441b-92d4-95c729ff1988');
    });

    it('ends a prior Assignment on creation', async () => {
      const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
      let priorAssignment = await user.getCurrentAssignment();
      assert(priorAssignment);
      assert(priorAssignment.endedAt === null);

      const response = await testSession
        .post('/api/assignments')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          userId: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          vehicleId: '91986460-5a12-426d-9855-93227b47ead5',
        })
        .expect(StatusCodes.CREATED);

      priorAssignment = await models.Assignment.findByPk(priorAssignment.id);
      assert(priorAssignment.endedAt !== null);

      await user.reload();
      const currentAssignment = await user.getCurrentAssignment();
      assert.deepStrictEqual(currentAssignment.id, response.body.Assignment?.id);
      assert.deepStrictEqual(currentAssignment.vehicleId, response.body.Assignment?.vehicleId);
    });
  });
});
