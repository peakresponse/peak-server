const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');

describe('/api/users', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'cities',
      'counties',
      'states',
      'psaps',
      'users',
      'nemsisStateDataSets',
      'nemsisSchematrons',
      'regions',
      'agencies',
      'regionAgencies',
      'versions',
      'vehicles',
      'assignments',
      'contacts',
      'employments',
      'scenes',
      'responders',
      'incidents',
    ]);
    testSession = session(app);
  });

  describe('GET /me', () => {
    it('returns unauthorized for an unauthenticated request', async () => {
      await testSession
        .get('/api/users/me')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .set('Accept', 'application/json')
        .expect(StatusCodes.UNAUTHORIZED);
    });

    it('returns the user record of the logged in user', async () => {
      await testSession
        .post('/login')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
        .expect(StatusCodes.OK);

      const response = await testSession.get('/api/users/me').set('Host', `bmacc.${process.env.BASE_HOST}`).expect(StatusCodes.OK);
      const data = response.body;
      assert(data.User);
      assert.deepStrictEqual(data.User.email, 'regular@peakresponse.net');
      assert.deepStrictEqual(data.Scene?.length, 1);
      assert.deepStrictEqual(data.Incident[0].id, '6621202f-ca09-4ad9-be8f-b56346d1de65');
      assert(data.Assignment);
      assert(data.Vehicle);
      assert.deepStrictEqual(data.Vehicle.number, '88');
      assert.deepStrictEqual(data.Agency?.length, 1);
      assert.deepStrictEqual(data.Agency[0].subdomain, 'bmacc');
      assert(data.Employment);
      assert(data.Employment.isOwner);
      assert.deepStrictEqual(data.Employment.roles, ['CONFIGURATION']);
    });

    it('returns the user record of the logged in user, including Region payload if any', async () => {
      await testSession
        .post('/login')
        .set('Host', `sffd.${process.env.BASE_HOST}`)
        .send({ email: 'sffd.user@peakresponse.net', password: 'abcd1234' })
        .expect(StatusCodes.OK);

      const response = await testSession.get('/api/users/me').set('Host', `sffd.${process.env.BASE_HOST}`).expect(StatusCodes.OK);
      const data = response.body;
      assert.deepStrictEqual(data.User?.email, 'sffd.user@peakresponse.net');
      assert.deepStrictEqual(data.Region?.name, 'San Francisco County EMS Agency');
      assert.deepStrictEqual(data.Agency?.length, 3);
      assert.deepStrictEqual(data.Agency[0].subdomain, 'sffd');
      assert.deepStrictEqual(data.RegionAgency?.length, 3);
    });
  });
});
