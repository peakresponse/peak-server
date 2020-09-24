const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');

describe('/api/employments', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures(['users', 'states', 'agencies', 'employments']);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(HttpStatus.OK);
  });

  describe('GET /', () => {
    it('returns personnel Employment records', async () => {
      const response = await testSession
        .get('/api/employments')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(HttpStatus.OK);
      assert.deepStrictEqual(response.body?.length, 4);
    });

    it('returns pending personnel Employment records', async () => {
      const response = await testSession
        .get('/api/employments')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .query({ isPending: 1 })
        .expect(HttpStatus.OK);
      assert.deepStrictEqual(response.body?.length, 1);
      assert(response.body[0].isPending);
    });

    it('returns non-pending personnel Employment records', async () => {
      const response = await testSession
        .get('/api/employments')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .query({ isPending: 0 })
        .expect(HttpStatus.OK);
      assert.deepStrictEqual(response.body?.length, 3);
    });
  });
});
