const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');

describe('/api/responders', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'users',
      'states',
      'agencies',
      'contacts',
      'employments',
      'scenes',
      'sceneObservations',
      'responders',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(HttpStatus.OK);
  });

  describe('GET /', () => {
    it('returns Responders for a Scene', async () => {
      const response = await testSession
        .get('/api/responders')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .query({ sceneId: '25db9094-03a5-4267-8314-bead229eff9d' })
        .expect(HttpStatus.OK);
      const responders = response.body;
      assert(responders);
      assert.deepStrictEqual(responders.length, 2);
      assert.deepStrictEqual(responders[0].user.firstName, 'Bayshore');
      assert.deepStrictEqual(responders[0].user.lastName, 'User');
    });
  });
});
