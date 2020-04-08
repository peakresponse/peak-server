'use strict'

const assert = require('assert');

const helpers = require('../../../helpers');
const { County } = require('../../../../lib/codes');

describe('lib', function() {
  describe('codes', function() {
    describe('County', function() {
      describe('getCode()', function() {
        it('should return the closest matching code', async function() {
          assert.equal(await County.getCode('san francisco', '06'), '06075');
        });
      });

      describe('getName()', function() {
        it('should return the matching name', async function() {
          assert.equal(await County.getName('06075'), 'San Francisco County');
        });
      });
    });
  });
});
