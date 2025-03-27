const assert = require('assert');

require('../../helpers');

const models = require('../../../models');

describe('models', () => {
  describe('NemsisElement', () => {
    describe('.import()', () => {
      it('imports NEMSIS EMS Data Set elements', async () => {
        await models.NemsisElement.import('3.5.0.211008CP3');
        assert.deepStrictEqual(await models.NemsisElement.count(), 510);
      });
    });
  });
});
