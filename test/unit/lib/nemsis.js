/* eslint-disable func-names, no-await-in-loop */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

require('../../helpers');
const nemsis = require('../../../lib/nemsis');
const nemsisMocks = require('../../mocks/nemsis');

describe('lib', () => {
  describe('nemsis', () => {
    describe('getStateRepos()', () => {
      it('should retrieve a list of all the state repositories', async () => {
        nemsisMocks.mockReposRequest();

        const data = await nemsis.getStateRepos();
        assert(data.size);
        assert(data.size);
        assert(data.values);
      });
    });

    describe('getStateRepoFiles()', () => {
      it('should retrieve a list of files in the specified repository', async () => {
        nemsisMocks.mockCaliforniaFilesRequest();

        const data = await nemsis.getStateRepoFiles('california');
        assert(data.size);
        assert(data.size);
        assert(data.values);
      });
    });

    describe('downloadStateRepoFiles()', () => {
      it('should download all supported files in the specified repository into a tmp path', async () => {
        nemsisMocks.mockCaliforniaFilesRequest();
        nemsisMocks.mockCaliforniaDownloads();

        const data = await nemsis.getStateRepoFiles('california');
        const tmpDir = await nemsis.downloadRepoFiles('california', data.values);
        assert(tmpDir.name);
        assert(tmpDir.removeCallback);
        for (const filePath of data.values) {
          if (['.xml', '.xlsx'].includes(path.extname(filePath))) {
            assert(fs.existsSync(path.resolve(tmpDir.name, filePath)));
          }
        }
        tmpDir.removeCallback();
      });
    });

    describe('parseStateDataSet()', () => {
      it('should return the xml as a string and the parsed result as a js object', async function () {
        this.timeout(4000);
        nemsisMocks.mockCaliforniaFilesRequest();
        nemsisMocks.mockCaliforniaDownloads();

        const data = await nemsis.getStateRepoFiles('california');
        const tmpDir = await nemsis.downloadRepoFiles('california', data.values);
        for (const filePath of data.values) {
          if (filePath.startsWith('Resources') && filePath.endsWith('StateDataSet.xml')) {
            const result = await nemsis.parseStateDataSet(path.resolve(tmpDir.name, filePath));
            assert(result.json.StateDataSet._attributes['xsi:schemaLocation'].indexOf('3.5.0') >= 0);
            break;
          }
        }
        tmpDir.removeCallback();
      });
    });
  });
});
