// const assert = require('assert');
// const fs = require('fs');
const HttpStatus = require('http-status-codes');
// const moment = require('moment');
// const path = require('path');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
// const models = require('../../../models');

describe('/webhooks/hyannis', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'users',
      'clients',
      'tokens',
      'states',
      'counties',
      'cities',
      'psaps',
      'dispatchers',
      'nemsisStateDataSets',
      'nemsisSchematrons',
      'agencies',
      'versions',
      'employments',
    ]);
    testSession = session(app);
  });

  describe('POST /cad', () => {
    it('creates Vehicle records for the Agency, Incident and Scene records, and Dispatches', async () => {
      // post to webhook endpoint
      await testSession
        .post('/webhooks/hyannis/cad')
        .set('Host', `hyannis.${process.env.BASE_HOST}`)
        .set('Authorization', `Bearer 60679b8a-6786-4637-a0cc-1984c1673c91`)
        .set('Accept', 'application/json')
        .send({
          message: `Created: C:\\Users\\francisli\\Downloads\\filewatcher-windows-x64\\watch\\62589_AMB 2-8fb6025b-9c8d-4839-8686-db4686680276.xml
Created: C:\\Users\\francisli\\Downloads\\filewatcher-windows-x64\\watch\\62589_AMB 2-793fbb39-a090-4918-b62a-80302a249a06.xml
Created: C:\\Users\\francisli\\Downloads\\filewatcher-windows-x64\\watch\\62589_AMB 2-fc176bc8-a676-4ae6-aca0-1d48b59b15fd.xml
Created: C:\\Users\\francisli\\Downloads\\filewatcher-windows-x64\\watch\\62589_AMB 2.xml
Created: C:\\Users\\francisli\\Downloads\\filewatcher-windows-x64\\watch\\62589_AMB 2-00caf241-465d-4c31-b635-4aaea8a6907e.xml
Created: C:\\Users\\francisli\\Downloads\\filewatcher-windows-x64\\watch\\62589_AMB 2-3ce78413-189c-484e-917f-0542374d83f7.xml
`,
        })
        .expect(HttpStatus.OK);
    });
  });
});
