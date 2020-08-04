'use strict'

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const helpers = require('../../../helpers');
const nemsis = require('../../../../lib/nemsis');
const nemsisStates = require('../../../../lib/nemsis/states');
const nemsisMocks = require('../../../mocks/nemsis');

describe('lib', function() {
  describe('nemsisStates.california', function() {
    describe('appendAgenciesFromSpreadsheet()', function() {
      it('should return the additional agencies as a json sAgency object', async function() {
        this.timeout(60000);
        nemsisMocks.mockCaliforniaFilesRequest();
        nemsisMocks.mockCaliforniaDownloads();

        const data = await nemsis.getStateRepoFiles('california');
        const tmpDir = await nemsis.downloadRepoFiles('california', data.values);
        for (let filePath of data.values) {
          if (filePath.startsWith('Resources') && filePath.endsWith('StateDataSet.xml')) {
            const dataSet = await nemsis.parseStateDataSet(path.resolve(tmpDir.name, filePath));
            const agencies = await nemsisStates.california.appendAgenciesFromSpreadsheet(dataSet);
            assert(agencies.sAgencyGroup);
            assert.equal(agencies.sAgencyGroup.length, 618);
            assert.equal(dataSet.json.StateDataSet.sAgency.sAgencyGroup.length, 1415);
            break;
          }
        }
        tmpDir.removeCallback();
      });
    });

    describe('parseFacilitySpreadsheet()', function() {
      it('should return the spreadsheet data as a json sFacility object', async function() {
        this.timeout(60000);
        nemsisMocks.mockCaliforniaFilesRequest();
        nemsisMocks.mockCaliforniaDownloads();

        const data = await nemsis.getStateRepoFiles('california');
        const tmpDir = await nemsis.downloadRepoFiles('california', data.values);
        for (let filePath of data.values) {
          if (filePath.startsWith('Resources') && filePath.endsWith('Facilities.xlsx')) {
            const result = await nemsisStates.california.parseSpreadsheet(path.resolve(tmpDir.name, filePath));
            assert.equal(result.rows.length, 5203);
            const facilities = await nemsisStates.california.parseFacilitySpreadsheet(result);
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
