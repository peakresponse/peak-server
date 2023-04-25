/* eslint-disable func-names, no-await-in-loop */
const assert = require('assert');
const fs = require('fs');
const HttpStatus = require('http-status-codes');
const path = require('path');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const nemsisStates = require('../../../lib/nemsis/states');

describe('/api/states', () => {
  let testSession;
  let repoPath;
  before(() => {
    repoPath = path.resolve(__dirname, '../../../nemsis/repositories/delaware/3.5.0');
  });

  beforeEach(async () => {
    await helpers.loadFixtures(['users', 'cities', 'counties', 'states']);
    testSession = session(app);
    await testSession.post('/login').send({ email: 'admin@peakresponse.net', password: 'abcd1234' }).expect(200);
  });

  describe('GET /', () => {
    it('should return a list of State records', async () => {
      const response = await testSession.get('/api/states/').expect(HttpStatus.OK);
      const data = response.body;
      assert(data.length);
      assert.deepStrictEqual(data.length, 16);
      assert.deepStrictEqual(data[0].name, 'Alabama');
    });
  });

  context('uninitialized', () => {
    before(() => {
      fs.rmSync(repoPath, { force: true, recursive: true });
    });

    describe('GET /:id/repository', () => {
      it('returns the initialization status of a state repository', async () => {
        const response = await testSession.get('/api/states/10/repository').expect(HttpStatus.OK);
        assert.deepStrictEqual(response.body, {
          initialized: false,
          dataSetVersions: [],
          emsSchematronVersions: [],
        });
      });
    });

    describe('PUT /:id/repository', () => {
      it('pulls the specified state repository', async () => {
        const response = await testSession.put('/api/states/10/repository').expect(HttpStatus.OK);
        assert.deepStrictEqual(response.body, {
          initialized: true,
          dataSetVersions: [
            '2023-03-02-b9155c6abb9902ffa9d9726f707b3f099d406039',
            '2022-09-01-156cb80db204e903a77bcb2eaccf36c0eae9796d',
            '2019-11-26-b4feff0d87c761c9205cf0a194f4d410f0cbec34',
            '2019-10-30-5658edf91fe2e90d272ce31859d4df2bf7cbd8e2',
            '2019-10-08-e4feccf266de894e5bf45e99d7bf3e978e5bb386',
            '2019-09-30-ffa327cf250d2065d0840724176bf7dcb77cfadc',
            '2019-04-26-b40131057feb8406ab0d1948eab992c1b42ccd36',
          ],
          emsSchematronVersions: [
            '2023-03-02-b9155c6abb9902ffa9d9726f707b3f099d406039',
            '2019-03-05-33a41c3727ae4a37943f2524bc3243f78a8c523c',
            '2017-10-04-2a6a2b7cfd26e0d380c62762348de2751896bade',
            '2017-09-29-17bf40b4b0d29f86b72d4a716a8581d4d661c48e',
          ],
        });
      });
    });
  });

  context('initialized', () => {
    before(async () => {
      const repo = nemsisStates.getNemsisStateRepo('10', '3.5.0');
      await repo.pull();
    });

    describe('GET /:id/repository', () => {
      it('returns the data set and schematron versions for a state repository', async () => {
        const response = await testSession.get('/api/states/10/repository').expect(HttpStatus.OK);
        assert.deepStrictEqual(response.body, {
          initialized: true,
          dataSetVersions: [
            '2023-03-02-b9155c6abb9902ffa9d9726f707b3f099d406039',
            '2022-09-01-156cb80db204e903a77bcb2eaccf36c0eae9796d',
            '2019-11-26-b4feff0d87c761c9205cf0a194f4d410f0cbec34',
            '2019-10-30-5658edf91fe2e90d272ce31859d4df2bf7cbd8e2',
            '2019-10-08-e4feccf266de894e5bf45e99d7bf3e978e5bb386',
            '2019-09-30-ffa327cf250d2065d0840724176bf7dcb77cfadc',
            '2019-04-26-b40131057feb8406ab0d1948eab992c1b42ccd36',
          ],
          emsSchematronVersions: [
            '2023-03-02-b9155c6abb9902ffa9d9726f707b3f099d406039',
            '2019-03-05-33a41c3727ae4a37943f2524bc3243f78a8c523c',
            '2017-10-04-2a6a2b7cfd26e0d380c62762348de2751896bade',
            '2017-09-29-17bf40b4b0d29f86b72d4a716a8581d4d661c48e',
          ],
        });
      });
    });
  });
});
