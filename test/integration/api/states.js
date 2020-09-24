/* eslint-disable func-names, no-await-in-loop */
const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');
const nemsisMocks = require('../../mocks/nemsis');

describe('/api/states', function () {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures(['users', 'counties', 'states']);
    testSession = session(app);
    await testSession
      .post('/login')
      .send({ email: 'admin@peakresponse.net', password: 'abcd1234' })
      .expect(200);
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

  describe('POST /', () => {
    it('should create a new State record and associated Agency and Facility records', async function () {
      if (!process.env.CI) {
        this.skip();
      }
      this.timeout(120000);
      nemsisMocks.mockAlabamaFilesRequest();
      nemsisMocks.mockAlabamaDownloads();

      let response = await testSession
        .post('/api/states/')
        .send({
          repo: 'alabama',
          name: 'Alabama',
        })
        .expect(HttpStatus.ACCEPTED);
      const data = response.body;
      assert(data.id);
      /// start polling for completion
      for (;;) {
        response = await testSession.get(`/api/states/${data.id}`);
        if (response.accepted) {
          assert(response.header['x-status']);
          await helpers.sleep(1000);
        } else {
          assert(response.status, HttpStatus.OK);
          break;
        }
      }
      const state = await models.State.findOne({ where: { id: data.id } });
      assert(state);
      assert.deepStrictEqual(state.name, 'Alabama');
      const agencies = await state.getAgencies();
      assert.deepStrictEqual(agencies.length, 307);
      const facilities = await models.Facility.findAll();
      assert.deepStrictEqual(facilities.length, 1263);
    });

    it('should handle CA facility spreadsheet', async function () {
      if (!process.env.CI) {
        this.skip();
      }
      this.timeout(120000);

      nemsisMocks.mockCaliforniaFilesRequest();
      nemsisMocks.mockCaliforniaDownloads();

      let response = await testSession
        .post('/api/states/')
        .send({
          repo: 'california',
          name: 'California',
        })
        .expect(HttpStatus.ACCEPTED);
      const data = response.body;
      assert(data.id);
      /// start polling for completion
      for (;;) {
        response = await testSession.get(`/api/states/${data.id}`);
        if (response.accepted) {
          await helpers.sleep(1000);
        } else {
          assert(response.status, HttpStatus.OK);
          break;
        }
      }
      const state = await models.State.findOne({ where: { id: data.id } });
      assert(state);
      assert.deepStrictEqual(state.name, 'California');
      const agencies = await state.getAgencies();
      assert.deepStrictEqual(agencies.length, 1411);
      const facilities = await models.Facility.findAll();
      assert.deepStrictEqual(facilities.length, 119);
    });

    it('should return an error if the State has already been created', async () => {
      nemsisMocks.mockAlabamaFilesRequest();
      nemsisMocks.mockAlabamaDownloads();

      await models.State.update(
        { isConfigured: true },
        { where: { id: '01' } }
      );
      const response = await testSession
        .post('/api/states/')
        .send({
          repo: 'alabama',
          name: 'Alabama',
        })
        .expect(422);
      const data = response.body;
      assert(data.messages);
      assert.deepStrictEqual(data.messages[0].path, 'repo');
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
      await testSession
        .get(`/api/states/01`)
        .expect(HttpStatus.ACCEPTED)
        .expect('X-Status', 'Processing');
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
