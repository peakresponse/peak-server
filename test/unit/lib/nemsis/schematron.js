const assert = require('assert');
const fs = require('fs');
const path = require('path');

// const nemsisPublic = require('../../../../lib/nemsis/public');
const nemsisSchematron = require('../../../../lib/nemsis/schematron');

function readXml(xmlPath) {
  let xml = fs.readFileSync(path.resolve(__dirname, '../../../fixtures/nemsis', xmlPath), 'utf8');
  // remove doctype declaraction
  xml = xml.replace(/<\?xml[^?]*\?>\s*/, '');
  return xml;
}

describe('lib', () => {
  describe('nemsis', () => {
    describe('schematron', () => {
      before(async function anon() {
        // temporarily skip all due to NEMSIS repo issues
        return this.skip();
        // await nemsisPublic.pull();
        // const repo = nemsisPublic.getNemsisPublicRepo('3.5.0.211008CP3');
        // await repo.pull();
      });

      describe('validateDemDataSet', () => {
        it('returns null if the specified XML passes XSD validation against the specified NEMSIS version of the DEMDataSet.xsd', async () => {
          const xml = readXml('full/2023-DEM-1_v350.xml');
          const result = await nemsisSchematron.validateDemDataSet('3.5.0.211008CP3', xml);
          assert.deepStrictEqual(result, null);
        });

        it('returns an error object if the specified XML fails XSD validation against the specified NEMSIS version of the DEMDataSet.xsd', async () => {
          const xml = readXml('fail/2023-DEM-FailSchematron_v350.xml');
          const result = await nemsisSchematron.validateDemDataSet('3.5.0.211008CP3', xml);
          assert(result);
          assert(result.$xml);
        });
      });
    });
  });
});
