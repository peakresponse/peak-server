const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');

describe('/api/incidents', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'states',
      'counties',
      'cities',
      'users',
      'agencies',
      'employments',
      'psaps',
      'dispatchers',
      'scenes',
      'incidents',
      'vehicles',
      'dispatches',
      'responders',
      'responses',
      'times',
      'situations',
      'dispositions',
      'histories',
      'narratives',
      'reports',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(HttpStatus.OK);
  });

  describe('GET /', () => {
    it('returns a paginated list of records', async () => {
      const response = await testSession
        .get('/api/incidents')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(HttpStatus.OK)
        .expect('X-Total-Count', '1');
      assert.deepStrictEqual(response.body.length, 1);
    });
  });

  describe('GET /:id', () => {
    it('returns a specific record by id', async () => {
      const response = await testSession
        .get(`/api/incidents/6621202f-ca09-4ad9-be8f-b56346d1de65`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(HttpStatus.OK)
      const incident = response.body;
      console.log(incident);
      assert.deepStrictEqual(incident.number, '12345678');
      assert.deepStrictEqual(incident.reports?.length, 1);
    });
  });
});
