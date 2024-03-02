const assert = require('assert');
const fs = require('fs');
const { StatusCodes } = require('http-status-codes');
const nock = require('nock');
const path = require('path');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const { NemsisClient, NemsisServer } = require('../../../lib/nemsis/webService');

/// initialize one instance to have access to dynamically loaded status messages
const server = new NemsisServer();

function readPayload(payloadPath) {
  let payload = fs.readFileSync(path.resolve(__dirname, '../../fixtures/nemsis', payloadPath), 'utf8');
  // remove doctype declaraction
  payload = payload.replace(/<\?xml[^?]*\?>\s*/, '');
  return payload;
}

describe('/soap/nemsis', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'users',
      'states',
      'counties',
      'cities',
      'psaps',
      'nemsisStateDataSets',
      'nemsisSchematrons',
      'regions',
      'agencies',
      'versions',
      'contacts',
      'employments',
    ]);
    testSession = session(app);

    nock('http://peakresponse.localhost:3000')
      .get('/soap/nemsis?wsdl')
      .reply(async (uri, requestBody, cb) => {
        const response = await testSession.get('/soap/nemsis?wsdl').expect(StatusCodes.OK);
        cb(null, [response.statusCode, response.text]);
      });

    nock('http://peakresponse.localhost:3000')
      .post('/soap/nemsis')
      .reply(async (uri, requestBody, cb) => {
        const response = await testSession.post('/soap/nemsis').type('text/xml').send(requestBody).expect(StatusCodes.OK);
        cb(null, [response.statusCode, response.text]);
      });
  });

  it('requires a valid Agency subdomain in the organization field', async () => {
    const client = await NemsisClient.create('http://peakresponse.localhost:3000/soap/nemsis?wsdl');
    client.username = 'regular@peakresponse.net';
    client.password = 'abcd1234';
    client.organization = 'foo';
    const response = await client.submitDemDataSet('', '3.5.0');
    assert.deepStrictEqual(response.statusCode, NemsisServer.StatusCodes.PERMISSION_DENIED_FOR_ORG);
  });

  it('requires a valid User credentials in the organization field', async () => {
    const client = await NemsisClient.create('http://peakresponse.localhost:3000/soap/nemsis?wsdl');
    client.username = 'regular@peakresponse.net';
    client.password = 'wrongpass';
    client.organization = 'bmacc';
    const response = await client.submitDemDataSet('', '3.5.0');
    assert.deepStrictEqual(response.statusCode, NemsisServer.StatusCodes.INVALID_CREDENTIALS);
  });

  describe('SubmitData', () => {
    let client;
    beforeEach(async () => {
      client = await NemsisClient.create('http://peakresponse.localhost:3000/soap/nemsis?wsdl');
      client.username = 'regular@peakresponse.net';
      client.password = 'abcd1234';
      client.organization = 'bmacc';
    });

    it('returns returns XSD validation errors for DEMDataSet', async () => {
      const payload = readPayload('fail/2023-DEM-FailXsd_v350.xml');
      const response = await client.submitDemDataSet(payload, '3.5.0');
      assert.deepStrictEqual(response.requestType, 'SubmitData');
      assert.deepStrictEqual(response.requestHandle, server.statusMessages[NemsisServer.StatusCodes.FAILED_IMPORT_XSD]);
      assert.deepStrictEqual(response.statusCode, NemsisServer.StatusCodes.FAILED_IMPORT_XSD);
      assert.deepStrictEqual(response.reports, {
        xmlValidationErrorReport: {
          totalErrorCount: 1,
          xmlError: [
            {
              desc: "Element '{http://www.nemsis.org}dPersonnel.24': [facet 'enumeration'] The value '9925015' is not an element of the set {'9925001', '9925002', '9925003', '9925005', '9925007', '9925023', '9925025', '9925027', '9925029', '9925031', '9925033', '9925035', '9925037', '9925039', '9925041', '9925043'}.",
              failedElementList: {
                xmlElementInfo: [
                  {
                    elementName: 'dPersonnel.24',
                    elementLocation: {
                      line: 1063,
                    },
                  },
                ],
              },
            },
          ],
        },
      });
    });

    it('returns returns Schematron validation errors for DEMDataSet', async () => {
      const payload = readPayload('fail/2023-DEM-FailSchematron_v350.xml');
      const response = await client.submitDemDataSet(payload, '3.5.0');
      assert.deepStrictEqual(response.requestType, 'SubmitData');
      assert.deepStrictEqual(response.requestHandle, server.statusMessages[NemsisServer.StatusCodes.FAILED_IMPORT_SCH_ERROR]);
      assert.deepStrictEqual(response.statusCode, NemsisServer.StatusCodes.FAILED_IMPORT_SCH_ERROR);
      assert.deepStrictEqual(response.reports?.xmlValidationErrorReport, {
        totalErrorCount: 0,
      });
      assert(response.reports?.schematronReport?.completeSchematronReport);
    });

    it('returns returns XSD validation errors for EMSDataSet', async () => {
      const payload = readPayload('fail/2023-EMS-FailXsd_v350.xml');
      const response = await client.submitEmsDataSet(payload, '3.5.0');
      assert.deepStrictEqual(response.requestType, 'SubmitData');
      assert.deepStrictEqual(response.requestHandle, server.statusMessages[NemsisServer.StatusCodes.FAILED_IMPORT_XSD]);
      assert.deepStrictEqual(response.statusCode, NemsisServer.StatusCodes.FAILED_IMPORT_XSD);
      assert.deepStrictEqual(response.reports, {
        xmlValidationErrorReport: {
          totalErrorCount: 1,
          xmlError: [
            {
              desc: "Element '{http://www.nemsis.org}eResponse.07': [facet 'enumeration'] The value '2207003' is not an element of the set {'2207011', '2207013', '2207015', '2207017', '2207019', '2207021', '2207023', '2207025', '2207027'}.",
              failedElementList: {
                xmlElementInfo: [
                  {
                    elementName: 'eResponse.07',
                    elementLocation: {
                      line: 38,
                    },
                  },
                ],
              },
            },
          ],
        },
      });
    });

    it('returns returns Schematron validation errors for EMSDataSet', async () => {
      const payload = readPayload('fail/2023-EMS-FailSchematron_v350.xml');
      const response = await client.submitEmsDataSet(payload, '3.5.0');
      assert.deepStrictEqual(response.requestType, 'SubmitData');
      assert.deepStrictEqual(response.requestHandle, server.statusMessages[NemsisServer.StatusCodes.FAILED_IMPORT_SCH_ERROR]);
      assert.deepStrictEqual(response.statusCode, NemsisServer.StatusCodes.FAILED_IMPORT_SCH_ERROR);
      assert.deepStrictEqual(response.reports?.xmlValidationErrorReport, {
        totalErrorCount: 0,
      });
      assert(response.reports?.schematronReport?.completeSchematronReport);
    });
  });
});
