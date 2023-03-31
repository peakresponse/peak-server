const assert = require('assert');
const fs = require('fs');
const path = require('path');

const nemsisPublic = require('../../../../lib/nemsis/public');
const nemsisXsd = require('../../../../lib/nemsis/xsd');

function readXml(xmlPath) {
  let xml = fs.readFileSync(path.resolve(__dirname, '../../../fixtures/nemsis', xmlPath), 'utf8');
  // remove doctype declaraction
  xml = xml.replace(/<\?xml[^?]*\?>\s*/, '');
  return xml;
}

describe('lib', () => {
  describe('nemsis', () => {
    describe('xsd', () => {
      before(async () => {
        await nemsisPublic.pull();
        const repo = nemsisPublic.getNemsisPublicRepo('3.5.0.211008CP3');
        await repo.pull();
      });

      describe('validateDemDataSet', () => {
        it('returns null if the specified XML passes XSD validation against the specified NEMSIS version of the DEMDataSet.xsd', async () => {
          const xml = readXml('full/2021-DEM-1_v350.xml');
          const result = await nemsisXsd.validateDemDataSet('3.5.0.211008CP3', xml);
          assert.deepStrictEqual(result, null);
        });

        it('returns an error object if the specified XML fails XSD validation against the specified NEMSIS version of the DEMDataSet.xsd', async () => {
          const xml = readXml('fail/2021-DEM-FailXsd_v350.xml');
          const result = await nemsisXsd.validateDemDataSet('3.5.0.211008CP3', xml);
          assert.deepStrictEqual(result, {
            errors: [
              {
                message: 'This field is not expected. Expected fields are: dConfiguration.ProcedureGroup.',
                path: "$['DemographicReport']['dConfiguration']['dConfiguration.ConfigurationGroup'][0]['dConfiguration.02']",
                value: null,
              },
            ],
            name: 'SchemaValidationError',
          });
        });
      });
    });
  });
});
