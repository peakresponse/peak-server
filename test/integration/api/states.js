/* eslint-disable func-names, no-await-in-loop */
const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');
const nemsisMocks = require('../../mocks/nemsis');

describe('/api/states', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures(['users', 'cities', 'counties', 'states']);
    testSession = session(app);
    await testSession.post('/login').send({ email: 'admin@peakresponse.net', password: 'abcd1234' }).expect(200);
  });

  describe('GET /', () => {
    it('should return a list of State records', async () => {
      const response = await testSession.get('/api/states/').expect(200);
      const data = response.body;
      assert(data.length);
      assert.deepStrictEqual(data.length, 7);
      assert.deepStrictEqual(data[0].name, 'Alabama');
    });
  });

  describe('POST /:id/configure', () => {
    it('should configure a State record and associated Agency and Facility records', async function () {
      if (!process.env.CI) {
        this.skip();
      }
      nemsisMocks.mockReposRequest();
      nemsisMocks.mockCaliforniaFilesRequest();
      nemsisMocks.mockCaliforniaDownloads();

      let response = await testSession.post('/api/states/06/configure').expect(HttpStatus.ACCEPTED);
      /// start polling for completion
      for (;;) {
        response = await testSession.get(`/api/states/06`);
        if (response.accepted) {
          await helpers.sleep(1000);
        } else {
          assert(response.status, HttpStatus.OK);
          break;
        }
      }
      const state = await models.State.findOne({ where: { id: '06' } });
      assert(state);
      assert.deepStrictEqual(state.name, 'California');
      assert.deepStrictEqual(await state.countAgencies(), 1434);
      assert.deepStrictEqual(await models.Facility.count(), 119);
      const facility = await models.Facility.findOne({
        where: { stateId: '06', locationCode: '20046' },
        rejectOnEmpty: true,
      });
      assert.deepStrictEqual(facility.name, 'Sutter Health CPMC');
      assert.deepStrictEqual(facility.type, '1701005');
      assert.deepStrictEqual(facility.address, '3698 Sacramento Street');
      assert.deepStrictEqual(facility.cityId, '2411786');
      assert.deepStrictEqual(facility.countyId, '06075');
      assert.deepStrictEqual(facility.zip, '94118');
    });
  });

  describe('GET /:id', () => {
    it('should return accepted for a record in processing', async () => {
      await models.State.update(
        {
          dataSet: { status: 'Processing' },
        },
        { where: { id: '01' } }
      );
      await testSession.get(`/api/states/01`).expect(HttpStatus.ACCEPTED).expect('X-Status', 'Processing');
    });

    it('should return ok for a record done processing', async () => {
      await models.State.update(
        {
          dataSet: {},
        },
        { where: { id: '01' } }
      );
      await testSession.get(`/api/states/01`).expect(HttpStatus.OK);
    });
  });
});
