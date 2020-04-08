'use strict'

const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');
const nemsisMocks = require('../../mocks/nemsis');

describe('/api/states', function() {
  this.timeout(60000);

  let testSession;

  beforeEach(async function() {
    await helpers.loadFixtures(['users']);
    testSession = session(app);
    await testSession.post('/login')
      .send({email: 'johndoe@test.com', password: 'abcd1234'})
      .expect(200)
  });

  describe('GET /', function() {
    it('should return a list of State records', async function() {
      await models.State.create({code: '01', name: 'Alabama'});
      const response = await testSession.get('/api/states/')
        .expect(200);
      const data = response.body;
      assert(data.length);
      assert.equal(data.length, 1);
      assert.equal(data[0].name, 'Alabama');
    });
  });

  describe('POST /', function() {
    it('should create a new State record and associated Agency and Facility records', async function() {
      nemsisMocks.mockAlabamaFilesRequest();
      nemsisMocks.mockAlabamaDownloads();

      const response = await testSession.post('/api/states/')
        .send({
          repo: 'alabama',
          name: 'Alabama'
        })
        .expect(HttpStatus.ACCEPTED);
      const data = response.body;
      assert(data.id);
      /// start polling for completion
      while (true) {
        const response = await testSession.get(`/api/states/${data.id}`);
        if (response.accepted) {
          assert(response.header['x-status']);
          await helpers.sleep(1000);
          continue;
        }
        assert(response.status, HttpStatus.OK);
        break;
      }
      const state = await models.State.findOne({where: {id: data.id}});
      assert(state);
      assert.equal(state.name, 'Alabama');
      const agencies = await state.getAgencies();
      assert.equal(agencies.length, 307);
      const facilities = await models.Facility.findAll();
      assert.equal(facilities.length, 1263);
    });

    it('should handle CA facility spreadsheet', async function() {
      nemsisMocks.mockCaliforniaFilesRequest();
      nemsisMocks.mockCaliforniaDownloads();

      const response = await testSession.post('/api/states/')
        .send({
          repo: 'california',
          name: 'California'
        })
        .expect(HttpStatus.ACCEPTED);
      const data = response.body;
      assert(data.id);
      /// start polling for completion
      while (true) {
        const response = await testSession.get(`/api/states/${data.id}`);
        if (response.accepted) {
          await helpers.sleep(1000);
          continue;
        }
        assert(response.status, HttpStatus.OK);
        break;
      }
      const state = await models.State.findOne({where: {id: data.id}});
      assert(state);
      assert.equal(state.name, 'California');
      const agencies = await state.getAgencies();
      assert.equal(agencies.length, 793);
      const facilities = await models.Facility.findAll();
      assert.equal(facilities.length, 5203);
    });

    it('should return an error if the State has already been created', async function() {
      nemsisMocks.mockAlabamaFilesRequest();
      nemsisMocks.mockAlabamaDownloads();

      await models.State.create({code: '01', name: 'AL'});
      const response = await testSession.post('/api/states/')
        .send({
          repo: 'alabama',
          name: 'Alabama'
        })
        .expect(422);
      const data = response.body;
      assert(data.messages);
      assert.equal(data.messages[0]['path'], 'repo');
    });
  });

  describe('GET /:id', function() {
    it('should return accepted for a record in processing', async function() {
      const state = await models.State.create({code: '01', name: 'Alabama', dataSet: {status: 'Processing'}});
      const response = await testSession.get(`/api/states/${state.id}`)
        .expect(HttpStatus.ACCEPTED)
        .expect('X-Status', 'Processing');
    });

    it('should return ok for a record done processing', async function() {
      const state = await models.State.create({code: '01', name: 'Alabama', dataSet: {}});
      const response = await testSession.get(`/api/states/${state.id}`)
        .expect(HttpStatus.OK);
    });
  });
});
