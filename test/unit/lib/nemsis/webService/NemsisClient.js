const assert = require('assert');
const fs = require('fs');
const path = require('path');

require('../../../../helpers');

const { NemsisClient, NemsisServer } = require('../../../../../lib/nemsis/webService');

function readPayload(payloadPath) {
  let payload = fs.readFileSync(path.resolve(__dirname, '../../../../fixtures/nemsis', payloadPath), 'utf8');
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
            const payload = readPayload('fail/2023-DEM-FailXsd_v350.xml');
            const response = await client.submitDemDataSet(payload, '3.5.0');
            assert.deepStrictEqual(response.statusCode, NemsisServer.StatusCodes.FAILED_IMPORT_XSD);
          });

          it('submits an invalid (sch) DemDataSet payload to the SubmitData endpoint', async () => {
            const payload = readPayload('fail/2023-DEM-FailSchematron_v350.xml');
            const response = await client.submitDemDataSet(payload, '3.5.0');
            assert.deepStrictEqual(response.statusCode, NemsisServer.StatusCodes.FAILED_IMPORT_SCH_ERROR);
          });

          it('submits a complete valid payload to the SubmitData endpoint', async () => {
            const payload = readPayload('full/2023-DEM-1_v350.xml');
            const response = await client.submitDemDataSet(payload, '3.5.0');
            assert.deepStrictEqual(response.statusCode, NemsisServer.StatusCodes.SUCCESS);
          });
        });

        describe('.submitEmsDataSet()', () => {
          it('submits an invalid (xsd) EmsDataSet payload to the SubmitData endpoint', async () => {
            const payload = readPayload('fail/2023-EMS-FailXsd_v350.xml');
            const response = await client.submitEmsDataSet(payload, '3.5.0');
            assert.deepStrictEqual(response.statusCode, NemsisServer.StatusCodes.FAILED_IMPORT_XSD);
          });

          it('submits an invalid (sch) EmsDataSet payload to the SubmitData endpoint', async () => {
            const payload = readPayload('fail/2023-EMS-FailSchematron_v350.xml');
            const response = await client.submitEmsDataSet(payload, '3.5.0');
            assert.deepStrictEqual(response.statusCode, NemsisServer.StatusCodes.FAILED_IMPORT_SCH_ERROR);
          });

          it('submits a complete valid payload to the SubmitData endpoint', async () => {
            const payload = readPayload('full/2023-EMS-1-Opioid-Release_v350.xml');
            const response = await client.submitEmsDataSet(payload, '3.5.0');
            // now returning a warning expecting new ePatient.25 sex field
            assert.deepStrictEqual(response.statusCode, NemsisServer.StatusCodes.SUCCESS_WITH_SCH_WARN);
          });
        });
      });
    });
  });
});
