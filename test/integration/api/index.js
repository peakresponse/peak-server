const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

// eslint-disable-next-line no-unused-vars
const helpers = require('../../helpers');
const app = require('../../../app');

describe('/api', () => {
  let testSession;

  beforeEach(async () => {
    /// set an API LEVEL for testing
    process.env.API_LEVEL_MIN = 2;
    testSession = session(app);
  });

  after(() => {
    process.env.API_LEVEL_MIN = 1;
  });

  it('assumes a default level of 1', async () => {
    await testSession.get('/api/users/me').set('Accept', 'application/json').expect(HttpStatus.BAD_REQUEST);
  });

  it('rejects a request with a lower than minimum API level', async () => {
    await testSession.get('/api/users/me').set('X-Api-Level', '1').set('Accept', 'application/json').expect(HttpStatus.BAD_REQUEST);
  });

  it('accepts a request with minimum API level', async () => {
    await testSession.get('/api/users/me').set('X-Api-Level', '2').set('Accept', 'application/json').expect(HttpStatus.UNAUTHORIZED);
  });

  it('accepts a request with higher API level', async () => {
    await testSession.get('/api/users/me').set('X-Api-Level', '3').set('Accept', 'application/json').expect(HttpStatus.UNAUTHORIZED);
  });
});
