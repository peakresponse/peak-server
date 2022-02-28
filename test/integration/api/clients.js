const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');

describe('/api/clients', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures(['users', 'clients']);
    testSession = session(app);
    await testSession.post('/login').send({ email: 'admin@peakresponse.net', password: 'abcd1234' }).expect(HttpStatus.OK);
  });

  describe('GET /', () => {
    it('returns a paginated list of Clients', async () => {
      const response = await testSession.get('/api/clients').expect(HttpStatus.OK);
      assert.deepStrictEqual(response.body.length, 2);
    });
  });

  describe('POST /', () => {
    it('creates a new Client', async () => {
      const response = await testSession
        .post('/api/clients')
        .set('Accept', 'application/json')
        .send({
          name: 'Test Client',
          redirectUri: 'http://localhost:3000/callback',
        })
        .expect(HttpStatus.CREATED);

      assert(response.body.id);
      const client = await models.Client.findByPk(response.body.id);
      assert.deepStrictEqual(client.name, 'Test Client');
      assert.deepStrictEqual(client.redirectUri, 'http://localhost:3000/callback');
      assert(client.authenticate(response.body.clientSecret));
    });
  });

  describe('PATCH /:id', () => {
    it('updates an existing Client', async () => {
      const response = await testSession
        .patch('/api/clients/9db6b601-13fc-4755-906a-c532ce319be0')
        .set('Accept', 'application/json')
        .send({
          name: 'Renamed Client',
          redirectUri: 'http://localhost:3000/renamedcallback',
        })
        .expect(HttpStatus.OK);
      const client = await models.Client.findByPk(response.body.id);
      assert.deepStrictEqual(client.name, 'Renamed Client');
      assert.deepStrictEqual(client.redirectUri, 'http://localhost:3000/renamedcallback');
    });
  });

  describe('PATCH /:id/generate', () => {
    it('regenerates an existing Client id and secret', async () => {
      const client = await models.Client.findByPk('9db6b601-13fc-4755-906a-c532ce319be0');
      const oldClientId = client.clientId;

      const response = await testSession
        .patch('/api/clients/9db6b601-13fc-4755-906a-c532ce319be0/regenerate')
        .set('Accept', 'application/json')
        .expect(HttpStatus.OK);

      await client.reload();
      assert.notDeepStrictEqual(client.clientId, oldClientId);
      assert(client.authenticate(response.body.clientSecret));
    });
  });
});
