const nock = require('nock');
const path = require('path');

// Uncomment line below to record external HTTP calls
// nock.recorder.rec();

function mockPsapRegistryDownloads() {
  nock('https://www.fcc.gov:443', { encodedQueryParams: true })
    .get('/sites/default/files/masterpsapregistryv2.272.xlsx')
    .replyWithFile(200, path.resolve(__dirname, 'fcc', 'masterpsapregistryv2.272.xlsx'));
}

module.exports = {
  mockPsapRegistryDownloads,
};
