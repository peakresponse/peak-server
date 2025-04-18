const assert = require('assert');
const path = require('path');

const { NemsisEmsXsdParser } = require('../../../../lib/nemsis/emsXsdParser');

describe('lib', () => {
  describe('nemsis', () => {
    describe('NemsisEmsXsdParser', () => {
      let parser;

      before(async () => {
        parser = new NemsisEmsXsdParser(
          path.resolve(__dirname, '../../../fixtures/nemsis/nemsis_public/3.5.0.211008CP3/XSDs/NEMSIS_XSDs/EMSDataSet_v3.xsd'),
        );
      });

      describe('.parsePatientCareReport()', () => {
        it('returns the specific Nemsis version referenced by the data set', async () => {
          const result = await parser.parsePatientCareReport();
          assert.deepStrictEqual(result.children?.length, 25);
          assert.deepStrictEqual(result.children[0].name, 'eRecord');
          assert.deepStrictEqual(result.children[0].xsd, 'eRecord_v3.xsd');
          assert.deepStrictEqual(result.children[0].minOccurs, 1);
          assert.deepStrictEqual(result.children[0].maxOccurs, 1);
          assert.deepStrictEqual(result.children[0].definition, 'Patient Record Information');
        });
      });
    });
  });
});
