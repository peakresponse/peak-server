const assert = require('assert');
const fs = require('fs');
const path = require('path');

require('../../../helpers');

const { NemsisClient, NemsisServer } = require('../../../../lib/nemsis/webService');

function readPayload(payloadPath) {
  let payload = fs.readFileSync(path.resolve(__dirname, '../../../fixtures/nemsis', payloadPath), 'utf8');
  // remove doctype declaraction
  payload = payload.replace(/<\?xml[^?]*\?>\s*/, '');
  return payload;
}

describe('lib', () => {
  describe('nemsis', () => {
    describe('webService', () => {
      describe('NemsisClient', () => {
        let client;
        beforeEach(async () => {
          client = await NemsisClient.create('https://validator.nemsis.org/nemsisWs.wsdl');
          client.setEndpoint('https://validator.nemsis.org');
          client.username = process.env.NEMSIS_VALIDATOR_USERNAME;
          client.password = process.env.NEMSIS_VALIDATOR_PASSWORD;
          client.organization = process.env.NEMSIS_VALIDATOR_ORGANIZATION;
        });

        describe('.submitDemDataSet()', () => {
          it('submits an invalid (xsd) DemDataSet payload to the SubmitData endpoint', async () => {
            const payload = readPayload('fail/2021-DEM-FailXsd_v350.xml');
            const response = await client.submitDemDataSet(payload, '3.5.0');
            assert.deepStrictEqual(response.statusCode, NemsisServer.StatusCodes.FAILED_IMPORT_XSD);
          });

          it('submits an invalid (sch) DemDataSet payload to the SubmitData endpoint', async () => {
            const payload = readPayload('fail/2021-DEM-FailSchematron_v350.xml');
            const response = await client.submitDemDataSet(payload, '3.5.0');
            assert.deepStrictEqual(response.statusCode, NemsisServer.StatusCodes.FAILED_IMPORT_SCH_ERROR);
          });

          it('submits a complete valid payload to the SubmitData endpoint', async () => {
            const payload = readPayload('full/2021-DEM-1_v350.xml');
            const response = await client.submitDemDataSet(payload, '3.5.0');
            assert.deepStrictEqual(response.statusCode, NemsisServer.StatusCodes.SUCCESS);
          });
        });

        describe('.submitEmsDataSet()', () => {
          it('submits an invalid (xsd) EmsDataSet payload to the SubmitData endpoint', async () => {
            const payload = readPayload('fail/2021-EMS-FailXsd_v350.xml');
            const response = await client.submitEmsDataSet(payload, '3.5.0');
            assert.deepStrictEqual(response.statusCode, NemsisServer.StatusCodes.FAILED_IMPORT_XSD);
          });

          it('submits an invalid (sch) EmsDataSet payload to the SubmitData endpoint', async () => {
            const payload = readPayload('fail/2021-EMS-FailSchematron_v350.xml');
            const response = await client.submitEmsDataSet(payload, '3.5.0');
            assert.deepStrictEqual(response.statusCode, NemsisServer.StatusCodes.FAILED_IMPORT_SCH_ERROR);
          });

          it('submits a complete valid payload to the SubmitData endpoint', async () => {
            const payload = readPayload('full/2021-EMS-1-NoPatient_v350.xml');
            const response = await client.submitEmsDataSet(payload, '3.5.0');
            assert.deepStrictEqual(response.statusCode, NemsisServer.StatusCodes.SUCCESS);
          });
        });
      });

      describe('NemsisServer', () => {
        describe('.validateXMLWithSchematraon()', () => {
          it('returns null for a valid doc', async () => {
            const payload = readPayload('full/2021-DEM-1_v350.xml');
            const schematronReport = await NemsisServer.validateXMLWithSchematron(
              payload,
              path.resolve(__dirname, '../../../../nemsis/schematron/DEMDataSet.sch.xsl')
            );
            assert.deepStrictEqual(schematronReport, null);
          });

          it('returns a schematronReport for a failed validation', async () => {
            const payload = readPayload('fail/2021-DEM-FailSchematron_v350.xml');
            const schematronReport = await NemsisServer.validateXMLWithSchematron(
              payload,
              path.resolve(__dirname, '../../../../nemsis/schematron/DEMDataSet.sch.xsl')
            );
            assert(schematronReport);
            assert(schematronReport.completeSchematronReport);
          });
        });
      });
    });
  });
});
