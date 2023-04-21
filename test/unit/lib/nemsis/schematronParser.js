const assert = require('assert');
const path = require('path');

const { NemsisSchematronParser } = require('../../../../lib/nemsis/schematronParser');

describe('lib', () => {
  describe('nemsis', () => {
    describe('states', () => {
      describe('NemsisSchematronParser', () => {
        let schematronParser;
        beforeEach(() => {
          schematronParser = new NemsisSchematronParser(path.resolve(__dirname, '../../../fixtures/nemsis/schematron/DEMDataSet.sch'));
        });

        describe('.getDataSet()', () => {
          it('returns the data set type this schematron validates', async () => {
            const dataSet = await schematronParser.getDataSet();
            assert.deepStrictEqual(dataSet, 'DEMDataSet');
          });
        });

        describe('.getNemsisVersion()', () => {
          it('returns the specific Nemsis version referenced by the schematron', async () => {
            const schematronNemsisVersion = await schematronParser.getNemsisVersion();
            assert.deepStrictEqual(schematronNemsisVersion, '3.5.0.211008CP3');
          });
        });
      });
    });
  });
});
