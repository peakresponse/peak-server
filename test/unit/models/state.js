const assert = require('assert');

const models = require('../../../models');

describe('models', () => {
  describe('State', () => {
    describe('.getAbbrForCode()', () => {
      it('should return the state abbreviation for a given code', () => {
        assert.deepStrictEqual(models.State.getAbbrForCode('06'), 'CA');
      });
    });

    describe('.getCodeForAbbr()', () => {
      it('should return the state code for a given abbreviation', () => {
        assert.deepStrictEqual(models.State.getCodeForAbbr('ca'), '06');
      });
    });

    describe('.getCodeForName()', () => {
      it('should return the state code for a given name', () => {
        assert.deepStrictEqual(models.State.getCodeForName('California'), '06');
      });
    });

    describe('.getNameForCode()', () => {
      it('should return the state name for a given code', () => {
        assert.deepStrictEqual(models.State.getNameForCode('06'), 'California');
      });
    });
  });
});
