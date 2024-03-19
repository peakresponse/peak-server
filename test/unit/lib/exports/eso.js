const assert = require('assert');
const fs = require('fs/promises');
const path = require('path');

require('../../../helpers');

const { EsoClient } = require('../../../../lib/exports/eso');

describe('lib', () => {
  describe('exports', () => {
    describe('eso', () => {
      before(function anon() {
        // ESO staging environment is IP restricted, so disable in CI
        if (process.env.CI) {
          this.skip();
        }
      });

      describe('EsoClient', () => {
        describe('.authenticate()', () => {
          it('authenticates with the ESO Partner API to retrieve credentials', async () => {
            const client = new EsoClient('https://identity.stage.esosuite.net/auth/connect/token');
            client.username = process.env.ESO_STAGING_USERNAME;
            client.password = process.env.ESO_STAGING_PASSWORD;
            const credentials = await client.authenticate();
            const now = Date.now();
            assert(credentials?.access_token);
            assert.deepStrictEqual(credentials?.token_type, 'Bearer');
            assert.deepStrictEqual(credentials?.expires_in, 3600);
            assert.deepStrictEqual(
              credentials?.expires_at?.substring(0, credentials.expires_at.lastIndexOf(':')),
              new Date(now + 3300000).toISOString().substring(0, credentials.expires_at.lastIndexOf(':')),
            );
          });
        });

        describe('.submitEmsDataSet()', () => {
          it('submits an EPCR for import through the ESO Partner API', async () => {
            const epcrPath = path.resolve(__dirname, '../../../fixtures/files/eso.import.xml');
            const payload = await fs.readFile(epcrPath, { encoding: 'utf8' });
            const client = new EsoClient(
              'https://identity.stage.esosuite.net/auth/connect/token',
              'https://api.stage.esosuite.net/Partner/api/pcrimport',
            );
            client.username = process.env.ESO_STAGING_USERNAME;
            client.password = process.env.ESO_STAGING_PASSWORD;
            await client.authenticate();
            await client.submitEmsDataSet(payload);
          });
        });
      });
    });
  });
});
