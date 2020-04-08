'use strict'

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const helpers = require('../../../helpers');
const nemsis = require('../../../../lib/nemsis');
const nemsisMocks = require('../../../mocks/nemsis');

describe('lib', function() {
  describe('nemsis.california', function() {
    describe('parseFacilitySpreadsheet()', function() {
      it('should return the spreadsheet data as a json sFacility object', async function() {
        this.timeout(60000);
        nemsisMocks.mockCaliforniaFilesRequest();
        nemsisMocks.mockCaliforniaDownloads();

        const data = await nemsis.getStateRepoFiles('california');
        const tmpDir = await nemsis.downloadRepoFiles('california', data.values);
        for (let filePath of data.values) {
          if (filePath.startsWith('Resources') && filePath.endsWith('Facilities.xlsx')) {
            const result = await nemsis.parseSpreadsheet(path.resolve(tmpDir.name, filePath));
            assert.equal(result.rows.length, 5203);
            const facilities = await nemsis.california.parseFacilitySpreadsheet(result);
            assert(facilities.sFacilityGroup);
            assert.equal(facilities.sFacilityGroup.length, 13);
            break;
          }
        }
        tmpDir.removeCallback();
      });
    });
  });
});
