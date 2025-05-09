const assert = require('assert');

const helpers = require('../../helpers');

const routed = require('../../../lib/routed');
const { mockRouted } = require('../../mocks/routed');

describe('lib', () => {
  describe('routed', () => {
    describe('authorize', () => {
      it('returns an access token for valid client credentials', async () => {
        mockRouted();
        const credentials = await routed.authenticate({
          routedUrl: 'https://sf.routedapp.net',
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

    describe('upsertFacility', () => {
      it('creates or updates a facility in Routed', async () => {
        await helpers.loadFixtures([
          'users',
          'states',
          'counties',
          'cities',
          'psaps',
          'dispatchers',
          'nemsisStateDataSets',
          'nemsisSchematrons',
          'regions',
          'agencies',
          'versions',
          'employments',
          'venues',
          'facilities',
        ]);
        mockRouted();
        const data = await routed.upsertFacility('79ac2493-ab6a-4fa7-a04a-bde4b7a9f341');
        assert.deepStrictEqual(data.id, '79ac2493-ab6a-4fa7-a04a-bde4b7a9f341');
      });
    });

    describe('upsertMCI', () => {
      it('creates or updates a MCI in Routed', async () => {
        mockRouted();
        const data = await routed.upsertMCI(
          'https://sf.routedapp.net',
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

    describe('upsertVenue', () => {
      it('creates or updates a venue in Routed', async () => {
        await helpers.loadFixtures([
          'users',
          'states',
          'counties',
          'cities',
          'psaps',
          'dispatchers',
          'nemsisStateDataSets',
          'nemsisSchematrons',
          'regions',
          'agencies',
          'versions',
          'employments',
          'venues',
        ]);
        mockRouted();
        const data = await routed.upsertVenue('c99fba71-91bf-4a1a-80f8-89123c324687');
        assert.deepStrictEqual(data.id, 'c99fba71-91bf-4a1a-80f8-89123c324687');
      });
    });
  });
});
