const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');

describe('/api/users', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'users',
      'states',
      'agencies',
      'vehicles',
      'assignments',
      'contacts',
      'employments',
      'scenes',
      'responders',
    ]);
    testSession = session(app);
  });

  describe('GET /me', () => {
    it('returns unauthorized for an unauthenticated request', async () => {
      await testSession
        .get('/api/users/me')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .set('Accept', 'application/json')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('returns the user record of the logged in user', async () => {
      await testSession
        .post('/login')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
        .expect(HttpStatus.OK);

      const response = await testSession.get('/api/users/me').set('Host', `bmacc.${process.env.BASE_HOST}`).expect(HttpStatus.OK);
      const data = response.body;
      assert(data.user);
      assert.deepStrictEqual(data.user.email, 'regular@peakresponse.net');
      assert.deepStrictEqual(data.user.activeScenes?.length, 1);
      assert(data.user.currentAssignment);
      assert(data.user.currentAssignment.vehicle);
      assert.deepStrictEqual(data.user.currentAssignment.vehicle.number, '88');
      assert(data.agency);
      assert.deepStrictEqual(data.agency.subdomain, 'bmacc');
      assert(data.employment);
      assert(data.employment.isOwner);
      assert.deepStrictEqual(data.employment.roles, []);
    });
  });
});
