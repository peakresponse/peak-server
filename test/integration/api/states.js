/* eslint-disable func-names, no-await-in-loop */
const assert = require('assert');
const fs = require('fs');
const { StatusCodes } = require('http-status-codes');
const path = require('path');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');
const nemsisStates = require('../../../lib/nemsis/states');
const fccMocks = require('../../mocks/fcc');

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
      const response = await testSession.get('/api/states/').expect(StatusCodes.OK);
      const data = response.body;
      assert(data.length);
      assert.deepStrictEqual(data.length, 19);
      assert.deepStrictEqual(data[0].name, 'Alabama');
    });
  });

  describe('PUT /:id/psaps', () => {
    it('should import PSAPs for the State', async () => {
      await fccMocks.mockPsapRegistryDownloads();
      await testSession.put('/api/states/06/psaps').expect(StatusCodes.OK);
      assert.deepStrictEqual(await models.Psap.count(), 598);
    });
  });

  context('uninitialized', () => {
    before(() => {
      fs.rmSync(repoPath, { force: true, recursive: true });
    });

    describe('GET /:id/repository', () => {
      it('returns the initialization status of a state repository', async () => {
        const response = await testSession.get('/api/states/10/repository').expect(StatusCodes.OK);
        assert.deepStrictEqual(response.body, {
          initialized: false,
          dataSetVersions: [],
          demSchematronVersions: [],
          emsSchematronVersions: [],
        });
      });
    });

    describe('PUT /:id/repository', () => {
      it('pulls the specified state repository', async () => {
        const response = await testSession.put('/api/states/10/repository').expect(StatusCodes.OK);
        assert.deepStrictEqual(response.body, {
          initialized: true,
          dataSetVersions: [
            '2024-05-01-6d155952e4cbd7d613268a5b3de7cdf6f9c1850a',
            '2024-04-16-697215090a0b320ccdad0ffe2ca041269c00c7ae',
            '2024-02-28-40c310be1b32e651225dc332a4cb0a4507184e27',
            '2024-02-16-904b96b37d2d8e63470fbfb9c37320d6edf08d75',
            '2023-12-30-325c3fd54eaa6672cd0530e4319981c9a35a090c',
            '2023-12-02-248d4a29699bd4aac893f40883d28e98a434569e',
            '2023-06-02-370fa47febdf457374a7dd1907dfefacd539bda4',
            '2023-05-27-ff13b8c96ce333b974669b3aacb6442faf9d9ef8',
            '2023-05-18-4ca62d3b2dc912a13e478a876bb60bd41ced0e2e',
            '2023-03-02-b9155c6abb9902ffa9d9726f707b3f099d406039',
            '2022-09-01-156cb80db204e903a77bcb2eaccf36c0eae9796d',
            '2019-11-26-b4feff0d87c761c9205cf0a194f4d410f0cbec34',
            '2019-10-30-5658edf91fe2e90d272ce31859d4df2bf7cbd8e2',
            '2019-10-08-e4feccf266de894e5bf45e99d7bf3e978e5bb386',
            '2019-09-30-ffa327cf250d2065d0840724176bf7dcb77cfadc',
            '2019-04-26-b40131057feb8406ab0d1948eab992c1b42ccd36',
          ],
          demSchematronVersions: [],
          emsSchematronVersions: [
            '2023-06-02-933643233e3928ff9abc6360a34ff4ee117f025b',
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
        const response = await testSession.get('/api/states/10/repository').expect(StatusCodes.OK);
        assert.deepStrictEqual(response.body, {
          initialized: true,
          dataSetVersions: [
            '2024-05-01-6d155952e4cbd7d613268a5b3de7cdf6f9c1850a',
            '2024-04-16-697215090a0b320ccdad0ffe2ca041269c00c7ae',
            '2024-02-28-40c310be1b32e651225dc332a4cb0a4507184e27',
            '2024-02-16-904b96b37d2d8e63470fbfb9c37320d6edf08d75',
            '2023-12-30-325c3fd54eaa6672cd0530e4319981c9a35a090c',
            '2023-12-02-248d4a29699bd4aac893f40883d28e98a434569e',
            '2023-06-02-370fa47febdf457374a7dd1907dfefacd539bda4',
            '2023-05-27-ff13b8c96ce333b974669b3aacb6442faf9d9ef8',
            '2023-05-18-4ca62d3b2dc912a13e478a876bb60bd41ced0e2e',
            '2023-03-02-b9155c6abb9902ffa9d9726f707b3f099d406039',
            '2022-09-01-156cb80db204e903a77bcb2eaccf36c0eae9796d',
            '2019-11-26-b4feff0d87c761c9205cf0a194f4d410f0cbec34',
            '2019-10-30-5658edf91fe2e90d272ce31859d4df2bf7cbd8e2',
            '2019-10-08-e4feccf266de894e5bf45e99d7bf3e978e5bb386',
            '2019-09-30-ffa327cf250d2065d0840724176bf7dcb77cfadc',
            '2019-04-26-b40131057feb8406ab0d1948eab992c1b42ccd36',
          ],
          demSchematronVersions: [],
          emsSchematronVersions: [
            '2023-06-02-933643233e3928ff9abc6360a34ff4ee117f025b',
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
