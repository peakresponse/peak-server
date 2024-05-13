const assert = require('assert');
const path = require('path');

const { NemsisDemDataSetParser } = require('../../../../lib/nemsis/demDataSetParser');

describe('lib', () => {
  describe('nemsis', () => {
    describe('NemsisDemDataSetParser', () => {
      let parser;

      before(async () => {
        parser = new NemsisDemDataSetParser(path.resolve(__dirname, '../../../fixtures/files/2024-DEM-1_v350.xml'));
      });

      describe('.getNemsisVersion()', () => {
        it('returns the specific Nemsis version referenced by the data set', async () => {
          const dataSetNemsisVersion = await parser.getNemsisVersion();
          assert.deepStrictEqual(dataSetNemsisVersion, '3.5.0.230317CP4');
        });
      });

      describe('.parseAgency()', () => {
        it('parses the dAgency record out of the DEM data set', async () => {
          await parser.parseAgency((agency, other) => {
            assert.deepStrictEqual(other.dataSetNemsisVersion, '3.5.0.230317CP4');
            assert.deepStrictEqual(agency, {
              'dAgency.01': { _text: 'A078' },
              'dAgency.02': { _text: '350-A078' },
              'dAgency.03': { _text: 'UCHealth EMS' },
              'dAgency.04': { _text: '08' },
              'dAgency.AgencyServiceGroup': [
                {
                  _attributes: { UUID: 'f7fccc46-9bab-4602-8795-c8d9e40bcff5' },
                  'dAgency.05': { _text: '08' },
                  'dAgency.06': [{ _text: '08069' }, { _text: '08123' }],
                  'dAgency.07': [
                    { _text: '08069000100' },
                    { _text: '08069000201' },
                    { _text: '08069000202' },
                    { _text: '08069000300' },
                    { _text: '08069000401' },
                    { _text: '08069000402' },
                    { _text: '08069000503' },
                    { _text: '08069000504' },
                    { _text: '08069000505' },
                    { _text: '08069000506' },
                    { _text: '08069000600' },
                    { _text: '08069000700' },
                    { _text: '08069000801' },
                    { _text: '08069000802' },
                    { _text: '08069000901' },
                    { _text: '08069000902' },
                    { _text: '08069001003' },
                    { _text: '08069001004' },
                    { _text: '08069001007' },
                    { _text: '08069001008' },
                    { _text: '08069001009' },
                    { _text: '08069001010' },
                    { _text: '08069001104' },
                    { _text: '08069001106' },
                    { _text: '08069001107' },
                    { _text: '08069001109' },
                    { _text: '08069001110' },
                    { _text: '08069001111' },
                    { _text: '08069001112' },
                    { _text: '08069001113' },
                    { _text: '08069001114' },
                    { _text: '08069001301' },
                    { _text: '08069001304' },
                    { _text: '08069001305' },
                    { _text: '08069001306' },
                    { _text: '08069001307' },
                    { _text: '08069001308' },
                    { _text: '08069001601' },
                    { _text: '08069001602' },
                    { _text: '08069001603' },
                    { _text: '08069001605' },
                    { _text: '08069001606' },
                    { _text: '08069001607' },
                    { _text: '08069001608' },
                    { _text: '08069001708' },
                    { _text: '08069001809' },
                    { _text: '08069002300' },
                    { _text: '08069002401' },
                    { _text: '08069002402' },
                    { _text: '08069002501' },
                    { _text: '08069002502' },
                    { _text: '08069002503' },
                    { _text: '08123002207' },
                    { _text: '08123002208' },
                    { _text: '08123002300' },
                    { _text: '08123002501' },
                  ],
                  'dAgency.08': [
                    { _text: '80512' },
                    { _text: '80521' },
                    { _text: '80524' },
                    { _text: '80525' },
                    { _text: '80526' },
                    { _text: '80528' },
                    { _text: '80535' },
                    { _text: '80536' },
                    { _text: '80537' },
                    { _text: '80538' },
                    { _text: '80545' },
                    { _text: '80546' },
                    { _text: '80547' },
                    { _text: '80549' },
                    { _text: '80550' },
                    { _text: '80610' },
                    { _text: '80611' },
                    { _text: '80612' },
                    { _text: '80615' },
                    { _text: '80622' },
                    { _text: '80624' },
                    { _text: '80631' },
                    { _text: '80644' },
                    { _text: '80648' },
                    { _text: '80649' },
                    { _text: '80650' },
                    { _text: '80729' },
                    { _text: '80742' },
                    { _text: '80754' },
                  ],
                },
                {
                  _attributes: { UUID: 'd4f31c16-2258-45cf-9e2d-b57ea975a5a4' },
                  'dAgency.05': { _text: '56' },
                  'dAgency.06': { _text: '56021' },
                  'dAgency.07': [
                    { _text: '56021000200' },
                    { _text: '56021000300' },
                    { _text: '56021000401' },
                    { _text: '56021000402' },
                    { _text: '56021000501' },
                    { _text: '56021000600' },
                    { _text: '56021000700' },
                    { _text: '56021000800' },
                    { _text: '56021000900' },
                    { _text: '56021001000' },
                    { _text: '56021001100' },
                    { _text: '56021001200' },
                    { _text: '56021001300' },
                    { _text: '56021001401' },
                    { _text: '56021001402' },
                    { _text: '56021001501' },
                    { _text: '56021001502' },
                    { _text: '56021001901' },
                    { _text: '56021001902' },
                    { _text: '56021002000' },
                    { _text: '56021980801' },
                  ],
                  'dAgency.08': [
                    { _text: '82001' },
                    { _text: '82005' },
                    { _text: '82007' },
                    { _text: '82009' },
                    { _text: '82050' },
                    { _text: '82053' },
                    { _text: '82054' },
                    { _text: '82059' },
                    { _text: '82060' },
                    { _text: '82061' },
                    { _text: '82063' },
                    { _text: '82081' },
                    { _text: '82082' },
                  ],
                },
              ],
              'dAgency.09': { _text: '9920001' },
              'dAgency.10': [{ _text: '9920005' }, { _text: '9920013' }, { _text: '9920019' }],
              'dAgency.11': { _text: '9917021' },
              'dAgency.12': { _text: '1016003' },
              'dAgency.13': { _text: '9912005' },
              'dAgency.14': { _text: '1018005' },
              'dAgency.AgencyYearGroup': [
                {
                  _attributes: { UUID: '994750b3-1590-457f-84ad-9ae8d6b2105a' },
                  'dAgency.15': { _text: '2021' },
                  'dAgency.16': { _text: '6340' },
                  'dAgency.17': { _text: '477187' },
                  'dAgency.18': { _text: '60173' },
                  'dAgency.19': { _text: '56958' },
                  'dAgency.20': { _text: '44512' },
                  'dAgency.21': { _text: '50348' },
                  'dAgency.22': { _text: '44921' },
                },
                {
                  _attributes: { UUID: '2e537491-028a-4ef7-bef1-cf2f0e074544' },
                  'dAgency.15': { _text: '2022' },
                  'dAgency.16': { _text: '6340' },
                  'dAgency.17': { _text: '478168' },
                  'dAgency.18': { _text: '58138' },
                  'dAgency.19': { _text: '53129' },
                  'dAgency.20': { _text: '43791' },
                  'dAgency.21': { _text: '59820' },
                  'dAgency.22': { _text: '54020' },
                },
              ],
              'dAgency.23': { _text: '1027009' },
              'dAgency.24': { _text: '9923003' },
              'dAgency.25': [{ _text: '1225658784' }, { _text: '1376168575' }, { _text: '1417512559' }, { _text: '1679143457' }],
              'dAgency.26': { _attributes: { 'xsi:nil': 'true', NV: '7701001' } },
            });
          });
        });
      });

      describe('.parseConfigurations', () => {
        it('parses the dConfiguration records out of the DEM data set', async () => {
          let count = 0;
          await parser.parseConfigurations((data, other) => {
            assert.deepStrictEqual(other.dataSetNemsisVersion, '3.5.0.230317CP4');
            count += 1;
          });
          assert.deepStrictEqual(count, 2);
        });
      });

      describe('.parseContacts', () => {
        it('parses the dContact records out of the DEM data set', async () => {
          let count = 0;
          await parser.parseContacts((data, other) => {
            assert.deepStrictEqual(other.dataSetNemsisVersion, '3.5.0.230317CP4');
            count += 1;
          });
          assert.deepStrictEqual(count, 2);
        });
      });

      describe('.parseCustomConfigurations', () => {
        it('parses the dCustomConfiguration records out of the DEM data set', async () => {
          let count = 0;
          await parser.parseCustomConfigurations((data, other) => {
            assert.deepStrictEqual(other.dataSetNemsisVersion, '3.5.0.230317CP4');
            assert.deepStrictEqual(data, {
              _attributes: { CustomElementID: 'dPersonnel.18' },
              'dCustomConfiguration.01': { _attributes: { nemsisElement: 'dPersonnel.18' }, _text: "EMS Personnel's Immunization Status" },
              'dCustomConfiguration.02': { _text: 'The type of immunization status.' },
              'dCustomConfiguration.03': { _text: '9902009' },
              'dCustomConfiguration.04': { _text: '9923001' },
              'dCustomConfiguration.05': { _text: '9903007' },
              'dCustomConfiguration.06': { _attributes: { nemsisCode: '9910027', customValueDescription: 'COVID-19' }, _text: '9910055' },
            });
            count += 1;
          });
          assert.deepStrictEqual(count, 1);
        });
      });

      describe('.parseCustomResults', () => {
        it('parses the dCustomResult records out of the DEM data set', async () => {
          let count = 0;
          await parser.parseCustomResults((data, other) => {
            assert.deepStrictEqual(other.dataSetNemsisVersion, '3.5.0.230317CP4');
            count += 1;
          });
          assert.deepStrictEqual(count, 3);
        });
      });

      describe('.parseDevices', () => {
        it('parses the dDevice records out of the DEM data set', async () => {
          let count = 0;
          await parser.parseDevices((data, other) => {
            assert.deepStrictEqual(other.dataSetNemsisVersion, '3.5.0.230317CP4');
            count += 1;
          });
          assert.deepStrictEqual(count, 2);
        });
      });

      describe('.parseFacilities', () => {
        it('parses the dFacility records out of the DEM data set', async () => {
          let count = 0;
          await parser.parseFacilities((data, other) => {
            assert.deepStrictEqual(other.dataSetNemsisVersion, '3.5.0.230317CP4');
            count += 1;
            if (count === 5) {
              assert.deepStrictEqual(other['dFacility.01']?._text, '1701019');
            } else {
              assert.deepStrictEqual(other['dFacility.01']?._text, '1701005');
            }
          });
          assert.deepStrictEqual(count, 5);
        });
      });

      describe('.parseLocations', () => {
        it('parses the dDevice records out of the DEM data set', async () => {
          let count = 0;
          await parser.parseLocations((data, other) => {
            assert.deepStrictEqual(other.dataSetNemsisVersion, '3.5.0.230317CP4');
            count += 1;
          });
          assert.deepStrictEqual(count, 2);
        });
      });

      describe('.parsePersonnel', () => {
        it('parses the dDevice records out of the DEM data set', async () => {
          let count = 0;
          await parser.parsePersonnel((data, other) => {
            assert.deepStrictEqual(other.dataSetNemsisVersion, '3.5.0.230317CP4');
            count += 1;
          });
          assert.deepStrictEqual(count, 4);
        });
      });

      describe('.parseVehicles', () => {
        it('parses the dDevice records out of the DEM data set', async () => {
          let count = 0;
          await parser.parseVehicles((data, other) => {
            assert.deepStrictEqual(other.dataSetNemsisVersion, '3.5.0.230317CP4');
            count += 1;
          });
          assert.deepStrictEqual(count, 2);
        });
      });
    });
  });
});
