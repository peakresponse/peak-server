const assert = require('assert');

require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Export', () => {
    describe('.password', () => {
      it('encrypts its new value into encryptedPassword', () => {
        const record = models.Export.build();
        record.password = 'abcd1234';
        assert(record.encryptedPassword);
        assert(record.password, 'abcd1234');
      });
    });
  });
});
