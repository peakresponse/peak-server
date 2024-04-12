const { MockAgent, setGlobalDispatcher } = require('undici');

function mockRouted() {
  const agent = new MockAgent();
  agent.disableNetConnect();

  const client = agent.get('https://localhost:5000');
  client
    .intercept({
      path: '/oauth/token',
      method: 'POST',
    })
    .reply(200, {
      access_token: 'a7e1c1715f4f6f0204cb4284cc0cbb1c30ffd9f873d1fc87297c18603f50cfe2',
      expires_in: 3599,
      token_type: 'Bearer',
    });
  client
    .intercept({
      path: '/api/mcis',
      method: 'POST',
    })
    .reply(201, {
      id: 'a205e679-6312-4fb2-a080-65958d129c78',
      incidentNumber: '001',
      address1: '200 Geary St',
      address2: null,
      city: null,
      state: null,
      zip: null,
      startedAt: '2024-04-12T19:33:00.000Z',
      endedAt: null,
      estimatedRedCount: 0,
      estimatedYellowCount: 0,
      estimatedGreenCount: 0,
      estimatedZebraCount: 0,
      CreatedById: '9770d622-fa21-47be-bf00-f4b3a6d4fc46',
      createdAt: '2024-04-12T21:33:28.219Z',
      UpdatedById: '9770d622-fa21-47be-bf00-f4b3a6d4fc46',
      updatedAt: '2024-04-12T21:33:28.219Z',
    });

  setGlobalDispatcher(agent);
}

module.exports = {
  mockRouted,
};
