const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../helpers');
const app = require('../../app');
const cache = require('../../lib/cache');

describe('/oauth', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures(['users', 'states', 'counties', 'cities', 'psaps', 'agencies', 'employments', 'clients', 'tokens']);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(HttpStatus.OK);
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
        .expect(HttpStatus.OK);
      assert(response.body.access_token);
      assert(response.body.token_type);
      assert(response.body.expires_in);
    });
  });
});
