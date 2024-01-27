const assert = require('assert');
const fs = require('fs');
const { StatusCodes } = require('http-status-codes');
const path = require('path');
const session = require('supertest-session');

const helpers = require('../../helpers');

const app = require('../../../app');

describe('/api/nemsis', () => {
  let testSession;

  before(function anon() {
    if (!process.env.CI) {
      this.skip();
      return;
    }
    const repoPath = path.resolve(__dirname, '../../../nemsis/repositories/nemsis_public');
    fs.rmSync(repoPath, { force: true, recursive: true });
  });

  beforeEach(async () => {
    await helpers.loadFixtures([
      'states',
      'counties',
      'cities',
      'users',
      'psaps',
      'nemsisStateDataSets',
      'nemsisSchematrons',
      'agencies',
      'versions',
      'employments',
    ]);
    testSession = session(app);
    await testSession.post('/login').send({ email: 'admin@peakresponse.net', password: 'abcd1234' }).expect(StatusCodes.OK);
  });

  describe('GET /', () => {
    it('returns all NEMSIS national public versions and versions installed', async () => {
      const response = await testSession.get('/api/nemsis').expect(StatusCodes.OK);
      const data = response.body;
      assert(data);
      assert.deepStrictEqual(data.versions.length, 5);
      assert.deepStrictEqual(data.versions, ['3.5.0.230317CP4', '3.5.0.211008CP3', '3.5.0.191130CP1', '3.5.0.190930', '3.5.0.190522']);
      assert.deepStrictEqual(data.versionsInstalled.length, 0);
    });
  });

  describe('POST /install', () => {
    it('installs the specified version of the NEMSIS public repo', async () => {
      const response = await testSession.post('/api/nemsis/install').send({ version: '3.5.0.211008CP3' }).expect(StatusCodes.OK);
      const data = response.body;
      assert(data);
      assert.deepStrictEqual(data.versions.length, 5);
      assert.deepStrictEqual(data.versions, ['3.5.0.230317CP4', '3.5.0.211008CP3', '3.5.0.191130CP1', '3.5.0.190930', '3.5.0.190522']);
      assert.deepStrictEqual(data.versionsInstalled.length, 1);
      assert.deepStrictEqual(data.versionsInstalled, ['3.5.0.211008CP3']);
    });
  });
});
