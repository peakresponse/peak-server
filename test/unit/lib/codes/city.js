'use strict'

const assert = require('assert');

const helpers = require('../../../helpers');
const { City } = require('../../../../lib/codes');

describe('lib', function() {
  describe('codes', function() {
    describe('City', function() {
      describe('getCode()', function() {
        it('should return the closest matching code', async function() {
          assert.equal(await City.getCode('san francisco', '06'), '2411786');
        });
      });

      describe('getName()', function() {
        it('should return the matching name', async function() {
          assert.equal(await City.getName('2411786'), 'City of San Francisco');
        });
      });
    });
  });
});
