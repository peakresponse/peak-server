'use strict'

const assert = require('assert');

const helpers = require('../../../helpers');
const { State } = require('../../../../lib/codes');

describe('lib', function() {
  describe('codes', function() {
    describe('State', function() {
      describe('values', function() {
        it('should have a list of name/code objects', function() {
          assert.equal(Object.keys(State.values).length, 58);
        });
      });

      describe('codeMapping', function() {
        it('should have a mapping of codes to objects', function() {
          assert.equal(State.codeMapping['06'].name, 'California');
        });
      });

      describe('nameMapping', function() {
        it('should have a mapping of names to objects', function() {
          assert.equal(State.nameMapping['California'].code, '06');
        });
      });
    });
  });
});
