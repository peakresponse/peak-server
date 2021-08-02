const nock = require('nock');
const path = require('path');

// Uncomment line below to record external HTTP calls
// nock.recorder.rec();

function mockDownloads(files) {
  for (const file of files) {
    nock('https://www.fcc.gov:443', { encodedQueryParams: true })
      .get(`/file/${file.number}/download`)
      .replyWithFile(200, path.resolve(__dirname, 'fcc', file.path));
  }
}

function mockPsapRegistryDownloads() {
  mockDownloads([{ number: '21421', path: 'masterpsapregistryv2.253.xlsx' }]);
}

module.exports = {
  mockPsapRegistryDownloads,
};
