const fs = require('fs');
const path = require('path');
const { MockAgent, setGlobalDispatcher } = require('undici');

function mockPsapRegistryDownloads() {
  const agent = new MockAgent();
  agent.disableNetConnect();

  const client = agent.get('https://www.fcc.gov');
  client
    .intercept({
      path: '/sites/default/files/masterpsapregistryv2.272.xlsx',
      method: 'GET',
    })
    .reply(200, fs.readFileSync(path.resolve(__dirname, 'fcc', 'masterpsapregistryv2.272.xlsx')));

  setGlobalDispatcher(agent);
}

module.exports = {
  mockPsapRegistryDownloads,
};
