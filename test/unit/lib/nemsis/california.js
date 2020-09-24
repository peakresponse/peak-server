/* eslint-disable no-await-in-loop */
const assert = require('assert');
const path = require('path');

const helpers = require('../../../helpers');
const nemsis = require('../../../../lib/nemsis');
const nemsisStates = require('../../../../lib/nemsis/states');
const nemsisMocks = require('../../../mocks/nemsis');

// eslint-disable-next-line func-names
describe('lib', function () {
  this.timeout(10000);

  describe('nemsisStates.california', () => {
    // eslint-disable-next-line func-names
    beforeEach(async function () {
      await helpers.loadFixtures(['counties']);
    });

    describe('appendAgenciesFromSpreadsheet()', () => {
      it('should return the additional agencies as a json sAgency object', async () => {
        nemsisMocks.mockCaliforniaFilesRequest();
        nemsisMocks.mockCaliforniaDownloads();

        const data = await nemsis.getStateRepoFiles('california');
        const tmpDir = await nemsis.downloadRepoFiles(
          'california',
          data.values
        );
        for (const filePath of data.values) {
          if (
            filePath.startsWith('Resources') &&
            filePath.endsWith('StateDataSet.xml')
          ) {
            const dataSet = await nemsis.parseStateDataSet(
              path.resolve(tmpDir.name, filePath)
            );
            const agencies = await nemsisStates.california.appendAgenciesFromSpreadsheet(
              dataSet
            );
            assert(agencies.sAgencyGroup);
            assert.deepStrictEqual(agencies.sAgencyGroup.length, 618);
            assert.deepStrictEqual(
              dataSet.json.StateDataSet.sAgency.sAgencyGroup.length,
              1415
            );
            break;
          }
        }
        tmpDir.removeCallback();
      });
    });

    describe('parseFacilitySpreadsheet()', () => {
      it('should return the spreadsheet data as a json sFacility object', async () => {
        nemsisMocks.mockCaliforniaFilesRequest();
        nemsisMocks.mockCaliforniaDownloads();

        const data = await nemsis.getStateRepoFiles('california');
        const tmpDir = await nemsis.downloadRepoFiles(
          'california',
          data.values
        );
        for (const filePath of data.values) {
          if (
            filePath.startsWith('Resources') &&
            filePath.endsWith('Facilities.xlsx')
          ) {
            const result = await nemsisStates.california.parseSpreadsheet(
              path.resolve(tmpDir.name, filePath)
            );
            assert.deepStrictEqual(result.rows.length, 119);
            const facilities = await nemsisStates.california.parseFacilitySpreadsheet(
              result
            );
            assert(facilities.sFacilityGroup);
            assert.deepStrictEqual(facilities.sFacilityGroup.length, 7);
            break;
          }
        }
        tmpDir.removeCallback();
      });
    });
  });
});
