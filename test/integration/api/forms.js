const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');

describe('/api/forms', () => {
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
      'forms',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(200);
  });

  describe('GET /', () => {
    it('returns a list of Forms for the current agency', async () => {
      const response = await testSession.get('/api/forms').set('Host', `bmacc.${process.env.BASE_HOST}`).expect(HttpStatus.OK);
      const records = response.body;
      assert.deepStrictEqual(records.length, 2);
      assert.deepStrictEqual(records[0].title, 'Patient / Patient Representative');
      assert.deepStrictEqual(records[1].title, 'Patient Refusal Against Medical Advice');
    });
  });
});
