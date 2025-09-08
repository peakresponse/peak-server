const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../helpers');
const models = require('../../models');
const app = require('../../app');
const cache = require('../../lib/cache');

describe('/oauth', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'users',
      'states',
      'counties',
      'cities',
      'psaps',
      'nemsisStateDataSets',
      'nemsisSchematrons',
      'regions',
      'agencies',
      'versions',
      'employments',
      'clients',
      'tokens',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(StatusCodes.OK);
  });

  describe('POST /authorize', () => {
    it('should return an authorization code for the logged in user', async () => {
      const response = await testSession.post('/oauth/authorize').set('Host', `bmacc.${process.env.BASE_HOST}`).send({
        response_type: 'code',
        client_id: 'sVKBATjgnoWeQDRfUraw',
        redirect_uri: 'http://localhost:3000/callback',
        state: 'test',
      });
      assert.deepStrictEqual(response.status, 302);
      const { location } = response.headers;
      const match = location.match(/http:\/\/localhost:3000\/callback\?code=([^&]+)&state=test/);
      assert(match);
      const code = match[1];
      assert(cache.get(`oauth_prc_${code}`));
    });

    it('fails if the redirect_uri does not match', async () => {
      const response = await testSession.post('/oauth/authorize').set('Host', `bmacc.${process.env.BASE_HOST}`).send({
        response_type: 'code',
        client_id: 'sVKBATjgnoWeQDRfUraw',
        redirect_uri: 'http://localhost:3000/mismatch',
        state: 'test',
      });
      assert.deepStrictEqual(response.status, 400);
      assert.deepStrictEqual(response.body.error, 'invalid_client');
    });

    it('fails for a Client that does not have support authorization_code grant type', async () => {
      const response = await testSession.post('/oauth/authorize').set('Host', `bmacc.${process.env.BASE_HOST}`).send({
        response_type: 'code',
        client_id: 'kr7yts6DCAopSAVvg5is',
        redirect_uri: 'http://localhost:3000/callback',
      });
      assert.deepStrictEqual(response.status, 400);
      assert.deepStrictEqual(response.body.error, 'unauthorized_client');
    });
  });

  describe('POST /token', () => {
    it('should return an access token for the authorization code', async () => {
      let response = await testSession.post('/oauth/authorize').set('Host', `bmacc.${process.env.BASE_HOST}`).send({
        response_type: 'code',
        client_id: 'sVKBATjgnoWeQDRfUraw',
        redirect_uri: 'http://localhost:3000/callback',
        state: 'test',
      });
      const { location } = response.headers;
      const match = location.match(/http:\/\/localhost:3000\/callback\?code=([^&]+)&state=test/);
      const code = match[1];

      // reset the session for the token call
      testSession = session(app);
      response = await testSession
        .post('/oauth/token')
        .type('form')
        .send({
          client_id: 'sVKBATjgnoWeQDRfUraw',
          client_secret: 'abcdefghijklmnopqrstuvwxyz01234567891234',
          grant_type: 'authorization_code',
          code,
          redirect_uri: 'http://localhost:3000/callback',
        })
        .expect(StatusCodes.OK);
      assert(response.body.access_token);
      assert(response.body.token_type);
      assert(response.body.expires_in);
      assert(response.body.refresh_token);
    });

    it('returns a token for the client credentials user', async () => {
      const response = await testSession
        .post('/oauth/token')
        .type('form')
        .send({
          client_id: 'kr7yts6DCAopSAVvg5is',
          client_secret: 'abcdefghijklmnopqrstuvwxyz01234567891234',
          grant_type: 'client_credentials',
        })
        .expect(StatusCodes.OK);
      assert(response.body.access_token);
      assert.deepStrictEqual(response.body.token_type, 'Bearer');
      assert(response.body.expires_in);

      const token = await models.Token.findOne({
        where: {
          accessToken: response.body.access_token,
        },
      });
      assert.deepStrictEqual(token.userId, '1ffac1a7-c1ac-432d-ac42-1e742bd4c8f6');
    });

    it('fails if the client does not support the grant type', async () => {
      const response = await testSession
        .post('/oauth/token')
        .type('form')
        .send({
          client_id: 'sVKBATjgnoWeQDRfUraw',
          client_secret: 'abcdefghijklmnopqrstuvwxyz01234567891234',
          grant_type: 'client_credentials',
        })
        .expect(StatusCodes.BAD_REQUEST);
      assert.deepStrictEqual(response.body.error, 'unauthorized_client');
    });
  });
});
