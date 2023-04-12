/* eslint-disable func-names, no-await-in-loop */
const assert = require('assert');
const fs = require('fs');
const HttpStatus = require('http-status-codes');
const path = require('path');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');

describe('/api/states', () => {
  let testSession;

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
      assert.deepStrictEqual(data.length, 15);
      assert.deepStrictEqual(data[0].name, 'Alabama');
    });
  });

  describe('GET /:id/repository', () => {
    let repoPath;
    before(() => {
      repoPath = path.resolve(__dirname, '../../../../nemsis/repositories/delaware/3.5.0');
    });

    context('uninitialized', () => {
      it('returns the initialization status of a state repository', async () => {
        fs.rmSync(repoPath, { force: true, recursive: true });
        const response = await testSession.get('/api/states/10/repository').expect(HttpStatus.OK);
        assert.deepStrictEqual(response.body, {
          initialized: false,
          dataSetVersionsInstalled: [],
          schematronVersionsInstalled: [],
        });
      });
    });
  });
});
