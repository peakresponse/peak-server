const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
// const models = require('../../../models');

describe('/api/counties', () => {
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
    it('should return a list of County records', async () => {
      const response = await testSession.get('/api/counties').set('Host', `bayshoreambulance.${process.env.BASE_HOST}`).expect(200);
      const data = response.body;
      assert(data.length);
      assert.deepStrictEqual(data.length, 4);
      assert.deepStrictEqual(data[0].name, 'Barnstable County');
    });

    it('should return a filtered list of City records', async () => {
      const response = await testSession
        .get('/api/counties?search=yak')
        .set('Host', `bayshoreambulance.${process.env.BASE_HOST}`)
        .expect(200);
      const data = response.body;
      assert(data.length);
      assert.deepStrictEqual(data.length, 1);
      assert.deepStrictEqual(data[0].name, 'Yakima County');
    });
  });

  describe('GET /:id', () => {
    it('should return a County record by id', async () => {
      const response = await testSession.get('/api/counties/06075').set('Host', `bayshoreambulance.${process.env.BASE_HOST}`).expect(200);
      const data = response.body;
      assert.deepStrictEqual(data?.name, 'San Francisco County');
    });
  });
});
