const assert = require('assert');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp-promise');

const utils = require('../../../lib/utils');

describe('lib', () => {
  describe('utils', () => {
    describe('file utils', () => {
      let tmpFile;

      beforeEach(async () => {
        tmpFile = await tmp.file();
      });

      afterEach(async () => {
        await tmpFile.cleanup();
      });

      describe('.base64Encode()', () => {
        it('encodes the specified file using base64', async () => {
          const srcPath = path.resolve(__dirname, '../../fixtures/files/512x512.png');
          await utils.base64Encode(srcPath, tmpFile.path);
          const test = fs.readFileSync(tmpFile.path);
          const compare = fs.readFileSync(path.resolve(__dirname, '512x512.png.base64.txt'));
          assert(test.equals(compare));
        });
      });

      describe('.insertFileIntoFile()', () => {
        it('inserts the src file into the dest file after the matched pattern', async () => {
          // make a copy of the dest file
          fs.copyFileSync(path.resolve(__dirname, 'test.before.xml'), tmpFile.path);
          // insert base64 encoded data into it
          const srcPath = path.resolve(__dirname, '512x512.png.base64.txt');
          await utils.insertFileIntoFile(srcPath, tmpFile.path, '(<eOther\\.11>)(8e693fb6-7f2a-4cc8-9d5f-d8eb5915bb60)(<\\/eOther\\.11>)');
          const test = fs.readFileSync(tmpFile.path);
          const compare = fs.readFileSync(path.resolve(__dirname, 'test.after.xml'));
          assert(test.equals(compare));
        });
      });
    });
  });
});
