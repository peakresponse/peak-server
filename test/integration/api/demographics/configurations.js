const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../../helpers');
const app = require('../../../../app');
const models = require('../../../../models');
const nemsisStates = require('../../../../lib/nemsis/states');

describe('/api/demographics/configurations', () => {
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
      'regions',
      'agencies',
      'versions',
      'employments',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(StatusCodes.OK);
  });

  describe('POST /import', () => {
    it('creates a new draft Configuration from NEMSIS State Data Set', async () => {
      const repo = nemsisStates.getNemsisStateRepo('06', '3.5.0');
      await repo.pull();

      const response = await testSession
        .post('/api/demographics/configurations/import')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(StatusCodes.OK);

      assert(response.body?.id);
      const configuration = await models.Configuration.findByPk(response.body.id);
      assert(configuration);
      assert.deepStrictEqual(configuration.isDraft, true);
      assert.deepStrictEqual(configuration.isValid, false);
      assert.deepStrictEqual(configuration.data?.['dConfiguration.ProcedureGroup']?.length, 12);
      assert.deepStrictEqual(configuration.data?.['dConfiguration.MedicationGroup']?.length, 12);
      assert.deepStrictEqual(configuration.data?.['dConfiguration.10']?.length, 112);
      assert.deepStrictEqual(
        configuration.validationErrors?.errors?.[0]?.path,
        "$['dConfiguration.ConfigurationGroup']['dConfiguration.13']",
      );
      assert.deepStrictEqual(
        configuration.validationErrors?.errors?.[1]?.path,
        "$['dConfiguration.ConfigurationGroup']['dConfiguration.16']",
      );
    });
  });
});
