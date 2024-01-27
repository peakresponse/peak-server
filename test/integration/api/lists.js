const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');

describe('/api/lists', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'states',
      'counties',
      'cities',
      'users',
      'psaps',
      'nemsisStateDataSets',
      'nemsisSchematrons',
      'agencies',
      'versions',
      'employments',
      'lists',
      'listSections',
      'listItems',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(StatusCodes.OK);
  });

  describe('GET /all', () => {
    it('returns all the lists for the user agency', async () => {
      const response = await testSession.get('/api/lists/all').set('Host', `bmacc.${process.env.BASE_HOST}`).expect(StatusCodes.OK);
      const data = response.body;
      assert(data);
      assert.deepStrictEqual(data.lists.length, 2);
      assert.deepStrictEqual(data.sections.length, 35);
      assert.deepStrictEqual(data.items.length, 248);
    });
  });
});
