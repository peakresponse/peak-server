const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

const oauth = require('../../../lib/oauth');
const cache = require('../../../lib/cache');

describe('lib', () => {
  describe('oauth', () => {
    beforeEach(async () => {
      await helpers.loadFixtures(['users', 'clients', 'tokens']);
    });

    describe('model', () => {
      describe('getAccessToken()', () => {
        it('returns an existing access Token', async () => {
          const token = await oauth.model.getAccessToken('YDB5awFMn47xKUSTTShPpzUF4pvPb68VSD8MBtcm');
          assert(token);
          assert.deepStrictEqual(token.client?.id, '9db6b601-13fc-4755-906a-c532ce319be0');
          assert.deepStrictEqual(token.user?.id, '7f666fe4-dbdd-4c7f-ab44-d9157379a680');
        });
      });

      describe('getClient()', () => {
        it('returns an existing Client', async () => {
          const client = await oauth.model.getClient('sVKBATjgnoWeQDRfUraw');
          assert(client);
        });

        it('validates Client secret if provided', async () => {
          let client = await oauth.model.getClient('sVKBATjgnoWeQDRfUraw', 'abcd1234');
          assert.deepStrictEqual(client, null);

          client = await oauth.model.getClient('sVKBATjgnoWeQDRfUraw', 'abcdefghijklmnopqrstuvwxyz01234567891234');
          assert(client);
        });
      });

      describe('saveAuthorizationCode()', () => {
        it('caches a new authorization code', async () => {
          const client = await models.Client.findByPk('b5856463-a1ac-4276-8d84-61a12b7b0c79');
          const user = await models.User.findByPk('7f666fe4-dbdd-4c7f-ab44-d9157379a680');
          const now = new Date();
          const code = oauth.model.saveAuthorizationCode(
            {
              authorizationCode: 'abcd1234',
              expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
              redirectUri: 'http://localhost:3000/callback',
            },
            client,
            user
          );
          assert(code);

          assert(cache.get(`oauth_prc_abcd1234`));
        });
      });

      describe('getAuthorizationCode()', () => {
        it('retrieves an authorization code', async () => {
          const client = await models.Client.findByPk('b5856463-a1ac-4276-8d84-61a12b7b0c79');
          const user = await models.User.findByPk('7f666fe4-dbdd-4c7f-ab44-d9157379a680');
          const now = new Date();
          const code = oauth.model.saveAuthorizationCode(
            {
              authorizationCode: 'abcd1234',
              expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
              redirectUri: 'http://localhost:3000/callback',
            },
            client,
            user
          );
          assert(code);

          const data = await oauth.model.getAuthorizationCode(code.authorizationCode);
          assert(data);
          assert.deepStrictEqual(data.code, code.authorizationCode);
          assert.deepStrictEqual(data.expiresAt, code.expiresAt);
          assert.deepStrictEqual(data.client?.id, client.id);
          assert.deepStrictEqual(data.user?.id, user.id);
        });
      });

      describe('revokeAuthorizationCode()', () => {
        it('revokes an authorization code', async () => {
          const client = await models.Client.findByPk('b5856463-a1ac-4276-8d84-61a12b7b0c79');
          const user = await models.User.findByPk('7f666fe4-dbdd-4c7f-ab44-d9157379a680');
          const now = new Date();
          const code = oauth.model.saveAuthorizationCode(
            {
              authorizationCode: 'abcd1234',
              expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
              redirectUri: 'http://localhost:3000/callback',
            },
            client,
            user
          );
          assert(code);
          assert(cache.get(`oauth_prc_abcd1234`));

          assert(oauth.model.revokeAuthorizationCode(code));
          assert.deepStrictEqual(cache.get(`oauth_prc_abcd1234`), undefined);
        });
      });

      describe('saveToken()', () => {
        it('creates a new access Token', async () => {
          const now = new Date();
          const client = await models.Client.findByPk('b5856463-a1ac-4276-8d84-61a12b7b0c79');
          const user = await models.User.findByPk('7f666fe4-dbdd-4c7f-ab44-d9157379a680');
          const token = await oauth.model.saveToken(
            {
              accessToken: 'abcd1234',
              accessTokenExpiresAt: now,
            },
            client,
            user
          );
          assert(token?.id);
          assert.deepStrictEqual(token.accessToken, 'abcd1234');
          assert.deepStrictEqual(token.accessTokenExpiresAt, now);
          assert.deepStrictEqual(token.client.id, client.id);
          assert.deepStrictEqual(token.user.id, user.id);
        });
      });
    });
  });
});
