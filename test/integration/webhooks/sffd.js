const assert = require('assert');
const fs = require('fs');
const HttpStatus = require('http-status-codes');
const path = require('path');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');

describe('/webhooks/sffd', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures(['users', 'states', 'agencies', 'employments']);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `sffd.${process.env.BASE_HOST}`)
      .send({ email: 'sffd.user@peakresponse.net', password: 'abcd1234' })
      .expect(HttpStatus.OK);
  });

  describe('POST /cad', () => {
    it('creates Vehicle records for the Agency', async () => {
      // read sample data
      const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'sffd.cad.json')));
      // post to webhook endpoint
      await testSession
        .post('/webhooks/sffd/cad')
        .set('Host', `sffd.${process.env.BASE_HOST}`)
        .set('Accept', 'application/json')
        .send(data)
        .expect(HttpStatus.OK);
      assert.deepStrictEqual(await models.Vehicle.count(), 26);
    });
  });
});
