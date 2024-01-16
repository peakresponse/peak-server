const nock = require('nock');
const path = require('path');

// Uncomment line below to record external HTTP calls
// nock.recorder.rec();

function mockValidatorEMSRequest() {
  nock('https://validator.nemsis.org:443', { encodedQueryParams: true })
    .get('/nemsisWs.wsdl')
    .replyWithFile(200, path.resolve(__dirname, '../fixtures/nemsis/nemsisWs.wsdl'));

  nock('https://validator.nemsis.org:443', { encodedQueryParams: true })
    .post('/')
    .reply(
      200,
      "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\"><SOAP-ENV:Header/><SOAP-ENV:Body><ns2:SubmitDataResponse xmlns:ns2=\"http://ws.nemsis.org/\"><ns2:requestType>SubmitData</ns2:requestType><ns2:requestHandle>XML validation failed. Please fix the error(s) then retry. This app currently is for validation only. RetrieveStatus() call is not implemented.</ns2:requestHandle><ns2:statusCode>-12</ns2:statusCode><ns2:reports><ns2:xmlValidationErrorReport><ns2:totalErrorCount>3</ns2:totalErrorCount><ns2:xmlError><ns2:desc>cvc-complex-type.2.4.b: The content of element 'eVitals' is not complete. One of '{\"http://www.nemsis.org\":eVitals.VitalGroup}' is expected.</ns2:desc><ns2:failedElementList><ns2:xmlElementInfo><ns2:elementName>UNKNOWN</ns2:elementName><ns2:elementLocation><ns2:line>142</ns2:line><ns2:column>23</ns2:column></ns2:elementLocation></ns2:xmlElementInfo></ns2:failedElementList></ns2:xmlError><ns2:xmlError><ns2:desc>cvc-complex-type.2.4.b: The content of element 'eMedications' is not complete. One of '{\"http://www.nemsis.org\":eMedications.MedicationGroup}' is expected.</ns2:desc><ns2:failedElementList><ns2:xmlElementInfo><ns2:elementName>UNKNOWN</ns2:elementName><ns2:elementLocation><ns2:line>150</ns2:line><ns2:column>28</ns2:column></ns2:elementLocation></ns2:xmlElementInfo></ns2:failedElementList></ns2:xmlError><ns2:xmlError><ns2:desc>cvc-complex-type.2.4.b: The content of element 'eProcedures' is not complete. One of '{\"http://www.nemsis.org\":eProcedures.ProcedureGroup}' is expected.</ns2:desc><ns2:failedElementList><ns2:xmlElementInfo><ns2:elementName>UNKNOWN</ns2:elementName><ns2:elementLocation><ns2:line>151</ns2:line><ns2:column>27</ns2:column></ns2:elementLocation></ns2:xmlElementInfo></ns2:failedElementList></ns2:xmlError></ns2:xmlValidationErrorReport></ns2:reports></ns2:SubmitDataResponse></SOAP-ENV:Body></SOAP-ENV:Envelope>",
      [
        'Date',
        'Tue, 16 Jan 2024 21:22:52 GMT',
        'Content-Type',
        'text/xml;charset=utf-8',
        'Content-Length',
        '1894',
        'Connection',
        'close',
        'Accept',
        'text/xml, text/html, image/gif, image/jpeg, *; q=.2, */*; q=.2',
        'SOAPAction',
        '""',
      ],
    );
}

module.exports = {
  mockValidatorEMSRequest,
};
