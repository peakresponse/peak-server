const assert = require('assert');
const fs = require('fs/promises');
const path = require('path');
// const tmp = require('tmp-promise');

// const nemsisPublic = require('../../../../lib/nemsis/public');
const nemsisTranslation = require('../../../../lib/nemsis/translation');

describe('lib', () => {
  describe('nemsis', () => {
    describe('translation', () => {
      let destPath;
      let cleanup;
      before(async function anon() {
        // temporarily skip all due to NEMSIS repo issues
        return this.skip();
        // ({ path: destPath, cleanup } = await tmp.file());
        // await nemsisPublic.pull();
        // const repo = nemsisPublic.getNemsisPublicRepo('3.5.0.211008CP3');
        // await repo.pull();
      });

      after(() => {
        cleanup();
      });

      describe('translateEmsDataSet', () => {
        it('converts NEMSIS 3.5.0 to 3.4.0', async () => {
          const sourcePath = path.resolve(__dirname, '../../../fixtures/nemsis/full/2023-EMS-1-Opioid-Release_v350.xml');
          await nemsisTranslation.translateEmsDataSet('3.5.0.211008CP3', sourcePath, '3.4.0', destPath);
          const dest = await fs.readFile(destPath, { encoding: 'utf8' });
          const compare = await fs.readFile(path.resolve(__dirname, '../../../fixtures/nemsis/full/2023-EMS-1-Opioid-Release_v340.xml'), {
            encoding: 'utf8',
          });
          assert.deepStrictEqual(dest, compare);
        });
      });
    });
  });
});
