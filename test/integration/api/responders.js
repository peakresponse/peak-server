const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');

describe('/api/responders', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures(['users', 'states', 'agencies', 'contacts', 'employments', 'scenes', 'responders']);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(HttpStatus.OK);
  });

  describe('GET /', () => {
    it('returns Responders for a Scene', async () => {
      const response = await testSession
        .get('/api/responders')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .query({ sceneId: '25db9094-03a5-4267-8314-bead229eff9d' })
        .expect(HttpStatus.OK);
      const responders = response.body;
      assert(responders);
      assert.deepStrictEqual(responders.length, 2);
      assert.deepStrictEqual(responders[0].user.firstName, 'Bayshore');
      assert.deepStrictEqual(responders[0].user.lastName, 'User');
    });
  });

  describe('PATCH /:id/assign', () => {
    it('assigns a Role to a Responder', async () => {
      await testSession
        .patch(`/api/responders/5d0b9f69-7bd4-4674-a2ef-9e0afdc14705/assign`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({ role: models.Responder.Roles.TREATMENT })
        .expect(HttpStatus.NO_CONTENT);
      const responder = await models.Responder.findByPk('5d0b9f69-7bd4-4674-a2ef-9e0afdc14705');
      assert.deepStrictEqual(responder.role, models.Responder.Roles.TREATMENT);
    });
  });
});
