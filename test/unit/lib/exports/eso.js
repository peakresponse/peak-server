const assert = require('assert');

require('../../../helpers');

const { EsoClient } = require('../../../../lib/exports/eso');

describe('lib', () => {
  describe('exports', () => {
    describe('eso', () => {
      describe('EsoClient', () => {
        describe('.authenticate', () => {
          it('authenticates with the ESO Partner API to retrieve credentials', async () => {
            const client = new EsoClient('https://identity.stage.esosuite.net/auth/connect/token');
            client.username = process.env.ESO_STAGING_USERNAME;
            client.password = process.env.ESO_STAGING_PASSWORD;
            const credentials = await client.authenticate();
            assert(credentials?.access_token);
            assert.deepStrictEqual(credentials?.token_type, 'Bearer');
            assert.deepStrictEqual(credentials?.expires_in, 3600);
          });
        });
      });
    });
  });
});
