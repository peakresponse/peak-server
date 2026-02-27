const assert = require('assert');
const fs = require('fs/promises');
const path = require('path');
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
      // load sample dispatch data
      const data = await fs.readFile(path.resolve(__dirname, 'hyannis', 'DISPATCH-SENT-02-19-2026_14-03-46-321'));
      // post to webhook endpoint
      await testSession
        .post('/webhooks/hyannis/cad')
        .set('Host', `hyannis.${process.env.BASE_HOST}`)
        .set('Authorization', `Bearer 60679b8a-6786-4637-a0cc-1984c1673c91`)
        .set('Accept', 'application/json')
        .set('X-Filename', 'DISPATCH-SENT-02-19-2026_14-03-46-321')
        .send(JSON.parse(data.toString()))
        .expect(StatusCodes.OK);

      // check that Incident and Scene records created
      const incident = await models.Incident.findOne({
        where: {
          number: '2026000948',
        },
      });
      assert(incident);
      assert.deepStrictEqual(incident.data, JSON.parse(data.toString()));

      const scene = await incident.getScene();
      assert(scene);
      assert.deepStrictEqual(scene.address1, '765 MAIN STREET');
      assert.deepStrictEqual(scene.address2, 'ROCKLAND TRUST');
      assert.deepStrictEqual(scene.cityId, '619333');
      assert.deepStrictEqual(scene.stateId, '25');
      assert.deepStrictEqual(scene.lat, '41.6469325');
      assert.deepStrictEqual(scene.lng, '-70.2961256');

      // check that Vehicle records are created for the Hyannis agency
      const amb1 = await models.Vehicle.findOne({
        where: {
          createdByAgencyId: '761f3479-f2d5-44bf-a2da-32ac969ccd5e',
          number: 'AMB 1',
        },
      });
      assert(amb1);
      const car10 = await models.Vehicle.findOne({
        where: {
          createdByAgencyId: '761f3479-f2d5-44bf-a2da-32ac969ccd5e',
          number: 'CAR 10',
        },
      });
      assert(car10);

      // check for corresponding Incident Dispatch records
      const dispatchAmb1 = await models.Dispatch.findOne({
        where: {
          incidentId: incident.id,
          vehicleId: amb1.id,
        },
      });
      assert(dispatchAmb1);
      assert.deepStrictEqual(dispatchAmb1.dispatchedAt, new Date('2026-02-19T19:03:46.321Z'));

      const dispatchCar10 = await models.Dispatch.findOne({
        where: {
          incidentId: incident.id,
          vehicleId: car10.id,
        },
      });
      assert(dispatchCar10);
      assert.deepStrictEqual(dispatchCar10.dispatchedAt, new Date('2026-02-19T19:03:46.321Z'));
    });

    it('updates existing records', async () => {
      // load sample dispatch data
      let data = await fs.readFile(path.resolve(__dirname, 'hyannis', 'DISPATCH-SENT-02-26-2026_17-26-31-946'));
      // post to webhook endpoint
      await testSession
        .post('/webhooks/hyannis/cad')
        .set('Host', `hyannis.${process.env.BASE_HOST}`)
        .set('Authorization', `Bearer 60679b8a-6786-4637-a0cc-1984c1673c91`)
        .set('Accept', 'application/json')
        .set('X-Filename', 'DISPATCH-SENT-02-26-2026_17-26-31-946')
        .send(JSON.parse(data.toString()))
        .expect(StatusCodes.OK);

      data = await fs.readFile(path.resolve(__dirname, 'hyannis', 'DISPATCH-SENT-02-26-2026_17-26-34-992'));
      // post to webhook endpoint
      await testSession
        .post('/webhooks/hyannis/cad')
        .set('Host', `hyannis.${process.env.BASE_HOST}`)
        .set('Authorization', `Bearer 60679b8a-6786-4637-a0cc-1984c1673c91`)
        .set('Accept', 'application/json')
        .set('X-Filename', 'DISPATCH-SENT-02-26-2026_17-26-31-946')
        .send(JSON.parse(data.toString()))
        .expect(StatusCodes.OK);

      // check that Incident and Scene records created
      const incident = await models.Incident.findOne({
        where: {
          number: '2026001293',
        },
      });
      assert(incident);
      assert.deepStrictEqual(incident.data, JSON.parse(data.toString()));

      const scene = await incident.getScene();
      assert(scene);
      assert.deepStrictEqual(scene.address1, '119 BAXTER ROAD');
      assert.deepStrictEqual(scene.address2, 'HOMELESS NOT HOPELESS');
      assert.deepStrictEqual(scene.cityId, '619333');
      assert.deepStrictEqual(scene.stateId, '25');
      assert.deepStrictEqual(scene.lat, '41.6613931833333');
      assert.deepStrictEqual(scene.lng, '-70.2897306166667');

      // check that Vehicle records are created for the Hyannis agency
      const amb1 = await models.Vehicle.findOne({
        where: {
          createdByAgencyId: '761f3479-f2d5-44bf-a2da-32ac969ccd5e',
          number: 'AMB 1',
        },
      });
      assert(amb1);

      // check for corresponding Incident Dispatch records
      const dispatchAmb1 = await models.Dispatch.findOne({
        where: {
          incidentId: incident.id,
          vehicleId: amb1.id,
        },
      });
      assert(dispatchAmb1);
      // should be original first dispatch record time
      assert.deepStrictEqual(dispatchAmb1.dispatchedAt, new Date('2026-02-26T22:26:31.946Z'));
    });
  });
});
