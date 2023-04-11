const assert = require('assert');

const nemsisStates = require('../../../../lib/nemsis/states');

describe('lib', () => {
  describe('nemsis', () => {
    describe('states', () => {
      describe('NemsisStateDataSet', () => {
        let repo;
        before(() => {
          repo = nemsisStates.getNemsisStateRepo('50', '3.5.0');
        });

        context('initialized', () => {
          before(async () => {
            await repo.pull();
          });

          describe('.version', () => {
            it('returns the version id of the state data set, if from the repo', () => {
              const stateDataSet = repo.getDataSet('2023-04-11-9574129ba2069ced561b85b18ad04d9f18855576');
              assert.deepStrictEqual(stateDataSet.version, '2023-04-11-9574129ba2069ced561b85b18ad04d9f18855576');
            });
          });

          describe('.parseAgencies()', () => {
            it('parses sAgency records out of the specified state data set version', async () => {
              const stateDataSet = repo.getDataSet('2023-04-11-9574129ba2069ced561b85b18ad04d9f18855576');
              let count = 0;
              await stateDataSet.parseAgencies((dataSetNemsisVersion, stateId) => {
                assert.deepStrictEqual(dataSetNemsisVersion, '3.5.0.191130CP1');
                assert.deepStrictEqual(stateId, '50');
                count += 1;
              });
              assert.deepStrictEqual(count, 163);
            });
          });

          describe('.parseConfiguration()', () => {
            it('parses the sConfiguration of the specified state data set version', async () => {
              const stateDataSet = repo.getDataSet('2023-04-11-9574129ba2069ced561b85b18ad04d9f18855576');
              await stateDataSet.parseConfiguration((nemsisVersion, data) => {
                assert.deepStrictEqual(nemsisVersion, '3.5.0.191130CP1');
                assert.deepStrictEqual(data['sConfiguration.01']?.length, 9);
                assert.deepStrictEqual(data['sConfiguration.ProcedureGroup']?.length, 7);
                assert.deepStrictEqual(data['sConfiguration.MedicationGroup']?.length, 7);
                assert.deepStrictEqual(data['sConfiguration.MedicationGroup']?.[0]['sConfiguration.05']?.length, 44);
                assert.deepStrictEqual(data['sConfiguration.MedicationGroup']?.[0]['sConfiguration.05']?.[0], {
                  _attributes: { CodeType: '9924003' },
                  _text: '161',
                });
                assert.deepStrictEqual(data['sConfiguration.06']?.length, 69);
              });
            });
          });

          describe('.parseFacilities()', () => {
            it('parses sFacility records out of the specified state data set version', async () => {
              const stateDataSet = repo.getDataSet('2023-04-11-9574129ba2069ced561b85b18ad04d9f18855576');
              let count = 0;
              await stateDataSet.parseFacilities(() => {
                count += 1;
              });
              assert.deepStrictEqual(count, 390);
            });
          });
        });
      });
    });
  });
});
