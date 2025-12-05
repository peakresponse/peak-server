const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');

describe('/api/agora', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'states',
      'counties',
      'cities',
      'psaps',
      'users',
      'nemsisStateDataSets',
      'nemsisSchematrons',
      'regions',
      'agencies',
      'versions',
      'employments',
    ]);
    testSession = session(app);
  });

  context('authorized', () => {
    beforeEach(async () => {
      await testSession
        .post('/login')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
        .expect(StatusCodes.OK);
    });

    describe('GET /rtm-token', () => {
      it('returns a token', async () => {
        const response = await testSession
          .get('/api/agora/rtm-token?channelName=test')
          .set('Host', `bmacc.${process.env.BASE_HOST}`)
          .expect(StatusCodes.OK);
        const data = response.body;
        assert.ok(data.token);
      });
    });

    describe('GET /rtc-token', () => {
      it('returns a token', async () => {
        const response = await testSession
          .get('/api/agora/rtc-token?channelName=test')
          .set('Host', `bmacc.${process.env.BASE_HOST}`)
          .expect(StatusCodes.OK);
        const data = response.body;
        assert.ok(data.token);
      });
    });
  });
});
