const assert = require('assert');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp-promise');

const utils = require('../../../lib/utils');

describe('lib', () => {
  describe('utils', () => {
    describe('.base64Encode()', () => {
      let tmpFile;

      // eslint-disable-next-line mocha/no-hooks-for-single-case
      beforeEach(async () => {
        tmpFile = await tmp.file();
      });

      // eslint-disable-next-line mocha/no-hooks-for-single-case
      afterEach(async () => {
        await tmpFile.cleanup();
      });

      it('encodes the specified file using base64', async () => {
        const srcPath = path.resolve(__dirname, '../../fixtures/files/512x512.png');
        await utils.base64Encode(srcPath, tmpFile.path);
        const test = fs.readFileSync(tmpFile.path);
        const compare = fs.readFileSync(`${srcPath}.base64.txt`);
        assert(test.equals(compare));
      });
    });
  });
});
