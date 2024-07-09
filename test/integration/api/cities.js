const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
// const models = require('../../../models');

describe('/api/cities', () => {
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
      'employments',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bayshoreambulance.${process.env.BASE_HOST}`)
      .send({ email: 'bayshore@peakresponse.net', password: 'abcd1234' })
      .expect(StatusCodes.OK);
  });

  describe('GET /', () => {
    it('should return a list of City records', async () => {
      const response = await testSession.get('/api/cities').set('Host', `bayshoreambulance.${process.env.BASE_HOST}`).expect(200);
      const data = response.body;
      assert(data.length);
      assert.deepStrictEqual(data.length, 5);
      assert.deepStrictEqual(data[0].featureName, 'Austin');
    });

    it('should return a filtered list of City records', async () => {
      const response = await testSession
        .get('/api/cities?search=yak')
        .set('Host', `bayshoreambulance.${process.env.BASE_HOST}`)
        .expect(200);
      const data = response.body;
      assert(data.length);
      assert.deepStrictEqual(data.length, 1);
      assert.deepStrictEqual(data[0].featureName, 'City of Yakima');
    });

    it('should return a sorted list of City records', async () => {
      const response = await testSession
        .get('/api/cities?lat=47.6200014&lng=-122.3512336')
        .set('Host', `bayshoreambulance.${process.env.BASE_HOST}`)
        .expect(200);
      const data = response.body;
      assert(data.length);
      assert.deepStrictEqual(data.length, 5);
      assert.deepStrictEqual(data[0].featureName, 'City of Yakima');
      assert.deepStrictEqual(data[1].featureName, 'City of San Francisco');
    });
  });
});
