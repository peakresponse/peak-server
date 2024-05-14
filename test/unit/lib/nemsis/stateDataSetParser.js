const assert = require('assert');

const nemsisStates = require('../../../../lib/nemsis/states');

describe('lib', () => {
  describe('nemsis', () => {
    describe('states', () => {
      describe('NemsisStateDataSetParser', () => {
        let repo;
        before(() => {
          repo = nemsisStates.getNemsisStateRepo('50', '3.5.0');
        });

        context('initialized', () => {
          before(async () => {
            await repo.pull();
            await repo.install('2023-04-11-9574129ba2069ced561b85b18ad04d9f18855576');
          });

          describe('.version', () => {
            it('returns the version id of the state data set, if from the repo', () => {
              const stateDataSetParser = repo.getDataSetParser('2023-04-11-9574129ba2069ced561b85b18ad04d9f18855576');
              assert.deepStrictEqual(stateDataSetParser.version, '2023-04-11-9574129ba2069ced561b85b18ad04d9f18855576');
            });
          });

          describe('.getNemsisVersion()', () => {
            it('returns the specific Nemsis version referenced by the data set', async () => {
              const stateDataSetParser = repo.getDataSetParser('2023-04-11-9574129ba2069ced561b85b18ad04d9f18855576');
              const dataSetNemsisVersion = await stateDataSetParser.getNemsisVersion();
              assert.deepStrictEqual(dataSetNemsisVersion, '3.5.0.191130CP1');
            });
          });

          describe('.getStateId()', () => {
            it('returns the state id referenced by the data set', async () => {
              const stateDataSetParser = repo.getDataSetParser('2023-04-11-9574129ba2069ced561b85b18ad04d9f18855576');
              const stateId = await stateDataSetParser.getStateId();
              assert.deepStrictEqual(stateId, '50');
            });
          });

          describe('.parseAgencies()', () => {
            it('parses sAgency records out of the specified state data set version', async () => {
              const stateDataSetParser = repo.getDataSetParser('2023-04-11-9574129ba2069ced561b85b18ad04d9f18855576');
              let count = 0;
              await stateDataSetParser.parseAgencies((data, other) => {
                assert.deepStrictEqual(other.dataSetNemsisVersion, '3.5.0.191130CP1');
                assert.deepStrictEqual(other['sState.01']?._text, '50');
                count += 1;
              });
              assert.deepStrictEqual(count, 163);
            });
          });

          describe('.parseConfiguration()', () => {
            it('parses the sConfiguration of the specified state data set version', async () => {
              const stateDataSetParser = repo.getDataSetParser('2023-04-11-9574129ba2069ced561b85b18ad04d9f18855576');
              await stateDataSetParser.parseConfiguration((data, other) => {
                assert.deepStrictEqual(other.dataSetNemsisVersion, '3.5.0.191130CP1');
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

          describe('.parseDEMCustomConfiguration()', () => {
            it('parses sdCustomConfiguration records out of the specified state data set version', async () => {
              const stateDataSetParser = repo.getDataSetParser('2023-04-11-9574129ba2069ced561b85b18ad04d9f18855576');
              let count = 0;
              await stateDataSetParser.parseDEMCustomConfiguration((data, other) => {
                assert.deepStrictEqual(other.dataSetNemsisVersion, '3.5.0.191130CP1');
                if (count === 0) {
                  assert.deepStrictEqual(data, {
                    _attributes: { CustomElementID: 'dAgency.11' },
                    'sdCustomConfiguration.01': { _attributes: { nemsisElement: 'dAgency.11' }, _text: 'dAgency.11' },
                    'sdCustomConfiguration.02': {
                      _text:
                        'The level of service which the agency provides EMS care for every request for service (the minimum certification level). This may be the license level granted by the state EMS office.',
                    },
                    'sdCustomConfiguration.03': { _text: '9902009' },
                    'sdCustomConfiguration.04': { _text: '9923001' },
                    'sdCustomConfiguration.05': { _text: '9903001' },
                    'sdCustomConfiguration.06': [
                      {
                        _attributes: {
                          customValueDescription: 'First Responder',
                          nemsisCode: '9917003',
                        },
                        _text: 'it9917.186',
                      },
                      {
                        _attributes: {
                          customValueDescription: 'Nurse',
                          nemsisCode: '9917031',
                        },
                        _text: 'it9917.189',
                      },
                    ],
                  });
                }
                count += 1;
              });
              assert.deepStrictEqual(count, 1);
            });
          });

          describe('.parseFacilities()', () => {
            it('parses sFacility records out of the specified state data set version', async () => {
              const stateDataSetParser = repo.getDataSetParser('2023-04-11-9574129ba2069ced561b85b18ad04d9f18855576');
              let count = 0;
              await stateDataSetParser.parseFacilities((data, other) => {
                assert.deepStrictEqual(other.dataSetNemsisVersion, '3.5.0.191130CP1');
                assert.deepStrictEqual(other['sState.01']?._text, '50');
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
