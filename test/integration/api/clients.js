const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');

describe('/api/clients', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures(['users', 'clients']);
    testSession = session(app);
    await testSession.post('/login').send({ email: 'admin@peakresponse.net', password: 'abcd1234' }).expect(StatusCodes.OK);
  });

  describe('GET /', () => {
    it('returns a paginated list of Clients', async () => {
      const response = await testSession.get('/api/clients').expect(StatusCodes.OK);
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
        .expect(StatusCodes.CREATED);

      assert(response.body.id);
      const client = await models.Client.findByPk(response.body.id);
      assert.deepStrictEqual(client.name, 'Test Client');
      assert.deepStrictEqual(client.redirectUri, 'http://localhost:3000/callback');
      assert(client.authenticate(response.body.clientSecret));
    });
  });

  describe('GET /:id', () => {
    it('returns an existing Client', async () => {
      const response = await testSession
        .get('/api/clients/9db6b601-13fc-4755-906a-c532ce319be0')
        .set('Accept', 'application/json')
        .expect(StatusCodes.OK);
      const data = response.body;
      delete data.updatedAt;
      assert.deepStrictEqual(data, {
        id: '9db6b601-13fc-4755-906a-c532ce319be0',
        name: 'Test Client 2',
        grants: ['authorization_code'],
        clientId: 'R7M6UhUuKq76aYtcdbr5',
        redirectUri: 'http://localhost:3000/callback',
        createdById: '7f666fe4-dbdd-4c7f-ab44-d9157379a680',
        updatedById: '7f666fe4-dbdd-4c7f-ab44-d9157379a680',
        createdAt: '2020-04-07T19:53:42.434Z',
      });
    });
  });

  describe('DELETE /:id', () => {
    it('deletes an existing Client', async () => {
      await testSession
        .delete('/api/clients/9db6b601-13fc-4755-906a-c532ce319be0')
        .set('Accept', 'application/json')
        .expect(StatusCodes.OK);
      const client = await models.Client.findByPk('9db6b601-13fc-4755-906a-c532ce319be0');
      assert.deepStrictEqual(client, null);
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
        .expect(StatusCodes.OK);
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
        .expect(StatusCodes.OK);

      await client.reload();
      assert.notDeepStrictEqual(client.clientId, oldClientId);
      assert(client.authenticate(response.body.clientSecret));
    });
  });
});
