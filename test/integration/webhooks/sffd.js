const assert = require('assert');
const fs = require('fs');
const HttpStatus = require('http-status-codes');
const moment = require('moment');
const path = require('path');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');

describe('/webhooks/sffd', () => {
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
      'agencies',
      'versions',
      'employments',
    ]);
    testSession = session(app);
  });

  describe('POST /cad', () => {
    it('creates Vehicle records for the Agency, Incident and Scene records, and Dispatches', async () => {
      // read sample data
      const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'sffd.cad.json')));
      // post to webhook endpoint
      await testSession
        .post('/webhooks/sffd/cad')
        .set('Host', `sffd.${process.env.BASE_HOST}`)
        // .set('Authorization', `Bearer 66ced5b6-6ed3-42e3-a11d-ea0d700dee9e`)
        .set('Authorization', `Bearer w125HmUqL32RXoeEBZu87kpQeogxLh9qqz4VDFSQ`)
        .set('Accept', 'application/json')
        .send(data)
        .expect(HttpStatus.OK);
      // check that Vehicle records created for the SFFD agency
      assert.deepStrictEqual(await models.Vehicle.count(), 29);
      assert(
        await models.Vehicle.findOne({
          where: {
            createdByAgencyId: '6bdc8680-9fa5-4ce3-86d9-7df940a7c4d8',
            number: 'M547',
          },
        }),
      );
      // check that Incident and Scene records created for each unique Incident No
      assert.deepStrictEqual(await models.Incident.count(), 49);
      const incident = await models.Incident.findOne({
        where: {
          number: '23163981',
        },
      });
      assert(incident);
      const scene = await incident.getScene();
      assert(scene);
      assert.deepStrictEqual(scene.address1, '887 POTRERO AV #2ND FL');
      assert.deepStrictEqual(scene.cityId, '2411786');
      assert.deepStrictEqual(scene.countyId, '06075');
      assert.deepStrictEqual(scene.stateId, '06');

      // check that Dispatch records created for each unit dispatched to Incident
      assert.deepStrictEqual(await models.Dispatch.scope('canonical').count(), 37);
      const dispatches = await incident.getDispatches({ include: [{ model: models.Vehicle, as: 'vehicle' }] });
      assert.deepStrictEqual(dispatches.length, 3);
      const vehicle1 = dispatches.find((dispatch) => dispatch.vehicle.number === 'M595');
      assert(vehicle1);
      assert.deepStrictEqual(moment(vehicle1.dispatchedAt).toISOString(), '2023-12-05T22:42:08.000Z');
      const vehicle2 = dispatches.find((dispatch) => dispatch.vehicle.number === 'M554');
      assert(vehicle2);
      assert.deepStrictEqual(moment(vehicle2.dispatchedAt).toISOString(), '2023-12-05T22:43:13.000Z');
      const vehicle3 = dispatches.find((dispatch) => dispatch.vehicle.number === 'M573');
      assert(vehicle3);
      assert.deepStrictEqual(moment(vehicle3.dispatchedAt).toISOString(), '2023-12-05T22:45:54.000Z');
    });
  });
});
