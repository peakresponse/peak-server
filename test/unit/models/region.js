const assert = require('assert');

require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Region', () => {
    describe('.routedClientSecret', () => {
      it('encrypts its new value into routedEncryptedClientSecret', () => {
        const record = models.Region.build();
        record.routedClientSecret = 'abcd1234';
        assert.ok(record.routedEncryptedClientSecret);
        assert(record.routedClientSecret, 'abcd1234');
      });
    });
  });
});
