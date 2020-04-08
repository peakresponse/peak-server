'use strict'

const assert = require('assert');
const helpers = require('../../../helpers');
const nemsis = require('../../../../lib/nemsis');

describe('lib', function() {
  describe('nemsis.commonTypes', function() {
    describe('enums', function() {
      it('should contain a dictionary of common type enums', function() {
        const enums = nemsis.commonTypes.enums;
        assert.equal(Object.keys(enums).length, 51);
        assert(enums['HospitalDesignation']);
      });

      describe('values', function() {
        it('should contain a list of name/value objects', function() {
          const enums = nemsis.commonTypes.enums;
          assert.equal(enums['HospitalDesignation'].values.length, 21);
          assert.deepStrictEqual(enums['HospitalDesignation'].values[0], {
            name: 'Behavioral Health',
            value: '9908001'
          });
        });
      })

      describe('nameMapping', function() {
        it('should contain a mapping of name to objects', function() {
          const enums = nemsis.commonTypes.enums;
          assert.equal(enums['HospitalDesignation'].nameMapping['Behavioral Health'], '9908001');
        });
      });

      describe('nameMapping', function() {
        it('should contain a mapping of value to objects', function() {
          const enums = nemsis.commonTypes.enums;
          assert.equal(enums['HospitalDesignation'].valueMapping['9908001'], 'Behavioral Health');
        });
      });
    });
  });
});
