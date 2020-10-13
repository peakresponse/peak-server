const assert = require('assert');

require('../../../helpers');
const nemsisCommonTypes = require('../../../../lib/nemsis/commonTypes');

describe('lib', () => {
  describe('nemsisCommonTypes', () => {
    describe('enums', () => {
      it('should contain a dictionary of common type enums', () => {
        const { enums } = nemsisCommonTypes;
        assert.deepStrictEqual(Object.keys(enums).length, 51);
        assert(enums.HospitalDesignation);
      });

      describe('values', () => {
        it('should contain a list of name/value objects', () => {
          const { enums } = nemsisCommonTypes;
          assert.deepStrictEqual(enums.HospitalDesignation.values.length, 21);
          assert.deepStrictEqual(enums.HospitalDesignation.values[0], {
            name: 'Behavioral Health',
            value: '9908001',
          });
        });
      });

      describe('nameMapping', () => {
        it('should contain a mapping of name to objects', () => {
          const { enums } = nemsisCommonTypes;
          assert.deepStrictEqual(enums.HospitalDesignation.nameMapping['Behavioral Health'], '9908001');
        });

        it('should contain a mapping of value to objects', () => {
          const { enums } = nemsisCommonTypes;
          assert.deepStrictEqual(enums.HospitalDesignation.valueMapping['9908001'], 'Behavioral Health');
        });
      });
    });
  });
});
