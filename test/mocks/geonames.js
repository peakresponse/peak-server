const fs = require('fs');
const path = require('path');
const { MockAgent, setGlobalDispatcher } = require('undici');

function mockDownloads(filePaths) {
  const agent = new MockAgent();
  agent.disableNetConnect();

  const client = agent.get('https://geonames.usgs.gov');
  for (const filePath of filePaths) {
    client
      .intercept({
        path: `/docs/federalcodes/${filePath}`,
        method: 'GET',
      })
      .reply(200, fs.readFileSync(path.resolve(__dirname, 'geonames', filePath)));
  }

  setGlobalDispatcher(agent);
}

function mockWashingtonDownloads() {
  mockDownloads(['WA_FedCodes.zip', 'OR_FedCodes.zip', 'ID_FedCodes.zip']);
}

module.exports = {
  mockWashingtonDownloads,
};
