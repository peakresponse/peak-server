const assert = require('assert');

require('../../helpers');

const routed = require('../../../lib/routed');
const { mockRouted } = require('../../mocks/routed');

describe('lib', () => {
  describe('routed', () => {
    describe('authorize', () => {
      it('returns an access token for valid client credentials', async () => {
        mockRouted();
        const credentials = await routed.authenticate({
          routedUrl: 'https://localhost:5000',
          routedClientId: 'Asxsppp1Xr5MKo8a6Dd8',
          routedClientSecret: 'V3NHL7VVDQYuxog93sBcXOAJuQ0BY02Cp92MDqEN',
          routedCredentials: null,
        });
        assert.deepStrictEqual(credentials, {
          access_token: 'a7e1c1715f4f6f0204cb4284cc0cbb1c30ffd9f873d1fc87297c18603f50cfe2',
          expires_at: credentials.expires_at,
          expires_in: 3599,
          token_type: 'Bearer',
        });
      });
    });

    describe('submit', () => {
      it('creates or updates a MCI in Routed', async () => {
        mockRouted();
        const data = await routed.submit(
          'https://localhost:5000',
          {
            access_token: 'a7e1c1715f4f6f0204cb4284cc0cbb1c30ffd9f873d1fc87297c18603f50cfe2',
          },
          {
            incidentNumber: '001',
            address1: '200 Geary St',
            startedAt: '2024-04-12T19:33:00Z',
          },
        );
        assert.deepStrictEqual(data.id, 'a205e679-6312-4fb2-a080-65958d129c78');
      });
    });
  });
});
