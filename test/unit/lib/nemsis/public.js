const assert = require('assert');
const fs = require('fs');
const path = require('path');

const nemsisPublic = require('../../../../lib/nemsis/public');

describe('lib', () => {
  describe('nemsis', () => {
    describe('public', () => {
      let repoPath;
      before(() => {
        repoPath = path.resolve(__dirname, '../../../../nemsis/repositories/nemsis_public');
      });

      context('not initialized', () => {
        before(function anon() {
          if (!process.env.CI) {
            this.skip();
            return;
          }
          fs.rmSync(repoPath, { force: true, recursive: true });
        });

        describe('.exists', () => {
          it('returns if the repo is initialized', () => {
            assert.deepStrictEqual(nemsisPublic.exists, false);
          });
        });

        describe('.pull()', () => {
          it('clones and then pulls the master public repository', async () => {
            assert.deepStrictEqual(nemsisPublic.exists, false);
            await nemsisPublic.pull();
            assert(fs.existsSync(repoPath));
            assert.deepStrictEqual(nemsisPublic.exists, true);
          });
        });
      });

      context('initialized', () => {
        before(async function anon() {
          if (!process.env.CI) {
            this.skip();
            return;
          }
          fs.rmSync(repoPath, { force: true, recursive: true });
          await nemsisPublic.pull();
        });

        describe('.exists', () => {
          it('returns if the repo is initialized', () => {
            assert.deepStrictEqual(nemsisPublic.exists, true);
          });
        });

        describe('.versions', () => {
          it('returns all the tagged version releases of the NEMSIS public repo', () => {
            assert.deepStrictEqual(nemsisPublic.versions, [
              '3.5.0.230317CP4',
              '3.5.0.211008CP3',
              '3.5.0.191130CP1',
              '3.5.0.190930',
              '3.5.0.190522',
            ]);
          });
        });

        describe('.versionsInstalled', () => {
          it('returns installed versions of the NEMSIS public repo', async () => {
            assert.deepStrictEqual(nemsisPublic.versionsInstalled, []);
            const repo = nemsisPublic.getNemsisPublicRepo('3.5.0.211008CP3');
            await repo.pull();
            assert.deepStrictEqual(nemsisPublic.versionsInstalled, ['3.5.0.211008CP3']);
          });
        });
      });

      describe('NemsisPublicRepo', () => {
        let repo;
        before(() => {
          repo = nemsisPublic.getNemsisPublicRepo('3.5.0.211008CP3');
        });

        describe('.baseNemsisVersion', () => {
          it('returns the base NEMSIS version', () => {
            assert.deepStrictEqual(repo.baseNemsisVersion, '3.5.0');
          });
        });

        context('not initialized', () => {
          before(function anon() {
            if (!process.env.CI) {
              this.skip();
              return;
            }
            fs.rmSync(repoPath, { force: true, recursive: true });
          });

          describe('.exists', () => {
            it('returns false if repo not cloned yet', () => {
              assert.deepStrictEqual(repo.exists, false);
            });
          });

          describe('.pull()', () => {
            it('clones and then pulls the repository for the specified version', async () => {
              assert.deepStrictEqual(repo.exists, false);
              await repo.pull();
              assert(fs.existsSync(repoPath));
              assert.deepStrictEqual(repo.exists, true);
            });
          });
        });

        context('initialized', () => {
          before(async () => {
            await repo.pull();
          });

          describe('.xsdPath()', () => {
            it('returns an absolute path to the specified XSD file', () => {
              const xsdPath = repo.xsdPath('dAgency_v3.xsd');
              assert.deepStrictEqual(xsdPath, path.resolve(repoPath, '3.5.0.211008CP3/XSDs/NEMSIS_XSDs', 'dAgency_v3.xsd'));
              assert(fs.existsSync(xsdPath));
            });
          });

          describe('.xsdWrapperPath()', () => {
            it('returns an absolute path to the specified XSD wrapper file', () => {
              const xsdPath = repo.xsdWrapperPath('dAgency_v3.xsd');
              assert.deepStrictEqual(xsdPath, path.resolve(repoPath, '3.5.0.211008CP3/XSDs/NEMSIS_XSDs/wrappers', 'dAgency_v3.xsd'));
              assert(fs.existsSync(xsdPath));
            });
          });
        });
      });
    });
  });
});
