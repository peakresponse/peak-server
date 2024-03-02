const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');

describe('/webhooks/hyannis', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'users',
      'clients',
      'tokens',
      'states',
      'counties',
      'cities',
      'psaps',
      'dispatchers',
      'nemsisStateDataSets',
      'nemsisSchematrons',
      'regions',
      'agencies',
      'versions',
      'employments',
    ]);
    testSession = session(app);
  });

  describe('POST /cad', () => {
    it('creates Vehicle records for the Agency, Incident and Scene records, and Dispatches', async () => {
      // post to webhook endpoint
      await testSession
        .post('/webhooks/hyannis/cad')
        .set('Host', `hyannis.${process.env.BASE_HOST}`)
        .set('Authorization', `Bearer 60679b8a-6786-4637-a0cc-1984c1673c91`)
        .set('Accept', 'application/json')
        .send({
          message: `Created: C:\\RedNMX\\ImageTrend\\CadFiles\\Archive\\62589_AMB 1.xml
Created: C:\\RedNMX\\ImageTrend\\CadFiles\\Archive\\62589_AMB 2.xml
Created: C:\\RedNMX\\ImageTrend\\CadFiles\\Archive\\62589_CAR 3.xml
`,
        })
        .expect(StatusCodes.OK);
      // check that Vehicle records are created for the Hyannis agency
      assert.deepStrictEqual(await models.Vehicle.count(), 3);
      assert(
        await models.Vehicle.findOne({
          where: {
            createdByAgencyId: '761f3479-f2d5-44bf-a2da-32ac969ccd5e',
            number: 'AMB 1',
          },
        }),
      );
      // check that Incident and Scene records created for each unique Incident No
      assert.deepStrictEqual(await models.Incident.count(), 1);
      const incident = await models.Incident.findOne({
        where: {
          number: '2023006083',
        },
      });
      assert(incident);
      const scene = await incident.getScene();
      assert(scene);
      assert.deepStrictEqual(scene.address1, '1095 IYANNOUGH ROAD');
      assert.deepStrictEqual(scene.cityId, '619333');
      assert.deepStrictEqual(scene.countyId, '25001');
      assert.deepStrictEqual(scene.stateId, '25');
      assert.deepStrictEqual(scene.zip, '02601');
    });
  });
});
