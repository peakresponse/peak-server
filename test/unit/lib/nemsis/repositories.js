const assert = require('assert');
const fs = require('fs');
const path = require('path');

const nemsisRepositories = require('../../../../lib/nemsis/repositories');

describe('lib', () => {
  describe('nemsis', () => {
    describe('repositories', () => {
      describe('getNemsisStateRepo', () => {
        it('returns a NemsisStateRepo instance for a valid State code', () => {
          const repo = nemsisRepositories.getNemsisStateRepo('50', '3.5.0');
          assert.deepStrictEqual(repo?.state.name, 'Vermont');
        });
      });

      describe('NemsisStateRepo', () => {
        let repo;
        let repoPath;
        before(() => {
          repo = nemsisRepositories.getNemsisStateRepo('50', '3.5.0');
          repoPath = path.resolve(__dirname, '../../../../nemsis/repositories/vermont/3.5.0');
        });

        context('not initialized', () => {
          before(() => {
            fs.rmSync(repoPath, { force: true, recursive: true });
          });

          describe('.exists', () => {
            it('returns false if repo not cloned yet', () => {
              assert.deepStrictEqual(repo.exists, false);
            });
          });

          describe('.toJSON()', () => {
            it('returns a JSON object representation of the repo', () => {
              assert.deepStrictEqual(repo.toJSON(), {
                initialized: false,
                dataSetVersionsInstalled: [],
                schematronVersionsInstalled: [],
              });
            });
          });

          describe('.pull()', () => {
            it('clones and then pulls the state repository for the specified version', async () => {
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

          describe('.dataSetVersions()', () => {
            it('returns a list of state data set versions', () => {
              assert.deepStrictEqual(repo.dataSetVersions, [
                '2023-02-21-001db2f318b31b46da54fb8891e195df6bb8947c',
                '2023-02-21-cdd1a71dd5d225ae255a0129f29c192dbbe659ba',
                '2023-02-17-291f15c28180cb073f23ed1e098ed4818ad92083',
                '2022-07-29-a64ecf2d094577f1c4dad4cef0a2b20321116ca7',
                '2022-07-29-f3d364373ca68e705b4bb0239de160f26b04d66e',
                '2022-07-06-b42c8064b0f9a9151581dddafd541cfd567ba125',
                '2022-05-19-2da6367790074246be2c8bb040c3e6f376fc282b',
                '2019-07-19-9aa92ee64cb8caf2e40607ff337c4306dd3e4faa',
              ]);
            });
          });

          describe('.dataSetVersionsInstalled()', () => {
            it('returns a list of state data set versions that have been installed', () => {
              assert.deepStrictEqual(repo.dataSetVersionsInstalled, [
                '2023-02-21-001db2f318b31b46da54fb8891e195df6bb8947c',
                '2023-02-17-291f15c28180cb073f23ed1e098ed4818ad92083',
              ]);
            });
          });

          describe('.schematronVersions()', () => {
            it('returns a list of state ems schematron versions', () => {
              assert.deepStrictEqual(repo.schematronVersions, [
                '2023-02-17-291f15c28180cb073f23ed1e098ed4818ad92083',
                '2021-09-02-602c70e4a2bf1958983ff73b60ef0a90378f2499',
                '2020-07-21-4d086393e1b48c920b035a3a705702f83777b8a5',
                '2019-07-19-9aa92ee64cb8caf2e40607ff337c4306dd3e4faa',
              ]);
            });
          });

          describe('.schematronVersionsInstalled()', () => {
            it('returns a list of state ems schematron versions installed', () => {
              assert.deepStrictEqual(repo.schematronVersionsInstalled, ['2023-02-17-291f15c28180cb073f23ed1e098ed4818ad92083']);
            });
          });

          describe('.parseAgencies()', () => {
            it('parses sAgency records out of the specified state data set version', async () => {
              let count = 0;
              await repo.parseAgencies('2023-02-21-001db2f318b31b46da54fb8891e195df6bb8947c', () => {
                count += 1;
              });
              assert.deepStrictEqual(count, 163);
            });
          });

          describe('.parseFacilities()', () => {
            it('parses sFacility records out of the specified state data set version', async () => {
              let count = 0;
              await repo.parseFacilities(
                '2023-02-21-001db2f318b31b46da54fb8891e195df6bb8947c',
                () => {
                  count += 1;
                }
              );
              assert.deepStrictEqual(count, 388);
            });
          });
        });
      });
    });
  });
});