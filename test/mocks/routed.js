const { MockAgent, setGlobalDispatcher } = require('undici');

function mockRouted() {
  const agent = new MockAgent();
  agent.disableNetConnect();

  const client = agent.get('https://sf.routedapp.net');
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
  client
    .intercept({
      path: '/api/organizations/c99fba71-91bf-4a1a-80f8-89123c324687',
      method: 'PUT',
    })
    .reply(201, {
      id: 'c99fba71-91bf-4a1a-80f8-89123c324687',
      name: 'Bill Graham Civic Auditorium',
      type: 'VENUE',
      state: 'CA',
      isMfaEnabled: false,
      isActive: true,
    });
  client
    .intercept({
      path: '/api/hospitals/79ac2493-ab6a-4fa7-a04a-bde4b7a9f341',
      method: 'PUT',
    })
    .reply(201, {
      id: '79ac2493-ab6a-4fa7-a04a-bde4b7a9f341',
      name: 'First Aid 1',
    });
  setGlobalDispatcher(agent);
}

module.exports = {
  mockRouted,
};
