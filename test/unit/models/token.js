const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Token', () => {
    beforeEach(async () => {
      await helpers.loadFixtures(['users', 'clients']);
    });

    describe('.generateAccessToken()', () => {
      it('generates a new access token', async () => {
        const token = models.Token.build();
        const now = new Date();
        token.generateAccessToken(now);
        assert(token.accessToken);
        assert.deepStrictEqual(token.accessTokenExpiresAt, now);
        token.userId = '7f666fe4-dbdd-4c7f-ab44-d9157379a680';
        token.clientId = 'b5856463-a1ac-4276-8d84-61a12b7b0c79';
        await token.save();
      });
    });
  });
});
