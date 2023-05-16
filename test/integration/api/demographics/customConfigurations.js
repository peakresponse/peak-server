const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../../helpers');
const app = require('../../../../app');
const nemsisStates = require('../../../../lib/nemsis/states');

describe('/api/demographics/custom-configurations', () => {
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
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(HttpStatus.OK);
  });

  describe('POST /import', () => {
    it('creates new draft DEM Custom Configurations from NEMSIS State Data Set', async () => {
      const repo = nemsisStates.getNemsisStateRepo('06', '3.5.0');
      await repo.pull();

      const response = await testSession
        .post('/api/demographics/custom-configurations/import')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(HttpStatus.OK);

      assert.deepStrictEqual(response.body?.length, 2);
      assert.deepStrictEqual(response.body[0].data?._attributes?.CustomElementID, 'dAgency.11');
      assert.deepStrictEqual(response.body[1].data?._attributes?.CustomElementID, 'dAgency.13');
    });
  });
});
