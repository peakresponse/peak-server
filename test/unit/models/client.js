const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Client', () => {
    beforeEach(async () => {
      await helpers.loadFixtures(['users']);
    });

    describe('.generateClientIdAndSecret()', () => {
      it('generates a new client id and secret', async () => {
        const client = models.Client.build();
        const { clientId, clientSecret } = client.generateClientIdAndSecret();
        assert(clientId);
        assert(clientSecret);
        assert.deepStrictEqual(clientId, client.clientId);
        assert(client.hashedClientSecret);
        assert(client.authenticate(clientSecret));

        client.name = 'Test Client';
        client.createdById = '7f666fe4-dbdd-4c7f-ab44-d9157379a680';
        client.updatedById = '7f666fe4-dbdd-4c7f-ab44-d9157379a680';
        client.redirectUri = 'http://localhost:3000/callback';
        await client.save();
      });
    });
  });
});
