const assert = require('assert');
const fs = require('fs');
const path = require('path');

const nemsisRepositories = require('../../../../lib/nemsis/repositories');

describe('lib', () => {
  describe('nemsis', () => {
    describe('repositories', () => {
      describe('getNemsisStateRepo', () => {
        it('returns a NemsisStateRepo instance for a valid State code', () => {
          const repo = nemsisRepositories.getNemsisStateRepo('10', '3.5.0');
          assert.deepStrictEqual(repo?.state.name, 'Delaware');
        });
      });

      describe('NemsisStateRepo', () => {
        context('not initialized', () => {
          let repoPath;
          before(() => {
            repoPath = path.resolve(__dirname, '../../../../nemsis/repositories/delaware/3.5.0');
            fs.rmSync(repoPath, { force: true, recursive: true });
          });

          describe('.exists', () => {
            it('returns false if repo not cloned yet', () => {
              const repo = nemsisRepositories.getNemsisStateRepo('10', '3.5.0');
              assert.deepStrictEqual(repo.exists, false);
            });
          });

          describe('.toJSON()', () => {
            it('returns a JSON object representation of the repo', () => {
              const repo = nemsisRepositories.getNemsisStateRepo('10', '3.5.0');
              assert.deepStrictEqual(repo.toJSON(), {
                initialized: false,
              });
            });
          });

          describe('.pull()', () => {
            it('clones and then pulls the state repository for the specified version', async () => {
              const repo = nemsisRepositories.getNemsisStateRepo('10', '3.5.0');
              assert.deepStrictEqual(repo.exists, false);
              await repo.pull();
              assert(fs.existsSync(repoPath));
              assert.deepStrictEqual(repo.exists, true);
            });
          });
        });

        context('initialized', () => {
          before(async () => {
            const repo = nemsisRepositories.getNemsisStateRepo('10', '3.5.0');
            await repo.pull();
          });
        });
      });
    });
  });
});
