const assert = require('assert');

require('../../../helpers');
const { State } = require('../../../../lib/codes');

describe('lib', () => {
  describe('codes', () => {
    describe('State', () => {
      describe('values', () => {
        it('should have a list of name/code objects', () => {
          assert.deepStrictEqual(Object.keys(State.values).length, 58);
        });
      });

      describe('codeMapping', () => {
        it('should have a mapping of codes to objects', () => {
          assert.deepStrictEqual(State.codeMapping['06'].name, 'California');
        });
      });

      describe('nameMapping', () => {
        it('should have a mapping of names to objects', () => {
          assert.deepStrictEqual(State.nameMapping.California.code, '06');
        });
      });
    });
  });
});
