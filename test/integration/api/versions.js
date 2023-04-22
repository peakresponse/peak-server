const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');

describe('/api/versions', () => {
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
      'agencies',
      'versions',
      'employments',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'personnel.admin@peakresponse.net', password: 'abcd1234' })
      .expect(HttpStatus.OK);
  });

  describe('GET /', () => {
    it('returns a list of Versions for the Agency', async () => {
      const response = await testSession.get('/api/versions').set('Host', `bmacc.${process.env.BASE_HOST}`).expect(HttpStatus.OK);
      const versions = response.body;
      assert.deepStrictEqual(versions?.length, 2);
    });
  });

  describe('GET /:id', () => {
    it('returns the specified Version for the Agency', async () => {
      const response = await testSession
        .get('/api/versions/c680282e-8756-4b02-82f3-2437c22ecade')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(HttpStatus.OK);
      assert.deepStrictEqual(response.body, {
        id: 'c680282e-8756-4b02-82f3-2437c22ecade',
        name: '2020-04-06-c680282e87564b0282f32437c22ecade',
        agencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
        isDraft: false,
        nemsisVersion: '3.5.0.211008CP3',
        stateDataSetId: '45b8b4d4-0fad-438a-b1b8-fa1425c6a5ae',
        demSchematronIds: [],
        emsSchematronIds: ['dabc90e5-b8fa-4dac-bcfd-be659ba46b54'],
        isValid: false,
        validationErrors: null,
        createdAt: '2020-04-06T21:22:10.158Z',
        createdById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
        updatedAt: response.body.updatedAt,
        updatedById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
      });
    });
  });
});
