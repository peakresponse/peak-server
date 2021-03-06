const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');

describe('/api/scenes', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'users',
      'states',
      'agencies',
      'contacts',
      'employments',
      'scenes',
      'sceneObservations',
      'scenePins',
      'responders',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(HttpStatus.OK);
  });

  describe('GET /', () => {
    it('returns closed scenes', async () => {
      const response = await testSession.get('/api/scenes').set('Host', `bmacc.${process.env.BASE_HOST}`).expect(HttpStatus.OK);
      assert.deepStrictEqual(response.body?.length, 1);
    });
  });

  describe('POST /', () => {
    it('creates a new scene', async () => {
      const response = await testSession
        .post('/api/scenes')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          name: 'New Scene',
        })
        .expect(HttpStatus.CREATED);
      assert(response.body?.id);
      const scene = await models.Scene.findByPk(response.body.id);
      assert(scene);
      assert.deepStrictEqual(scene.name, 'New Scene');
      assert(scene.isActive);

      const observations = await scene.getObservations();
      assert.deepStrictEqual(observations.length, 1);
      assert.deepStrictEqual(observations[0].name, 'New Scene');
      assert.deepStrictEqual(observations[0].updatedAttributes, ['name']);
    });
  });

  describe('GET /:id', () => {
    it('returns a scene', async () => {
      const response = await testSession
        .get(`/api/scenes/25db9094-03a5-4267-8314-bead229eff9d`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(HttpStatus.OK);
      assert.deepStrictEqual(response.body?.id, '25db9094-03a5-4267-8314-bead229eff9d');
      assert.deepStrictEqual(response.body?.name, 'Active Scene');
      assert(response.body?.isActive);
    });
  });

  describe('PATCH /:id/close', () => {
    it('closes a Scene', async () => {
      await testSession
        .patch(`/api/scenes/25db9094-03a5-4267-8314-bead229eff9d/close`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(HttpStatus.OK);
      const scene = await models.Scene.findByPk('25db9094-03a5-4267-8314-bead229eff9d');
      assert(scene);
      assert(scene.closedAt);
    });
  });

  describe('PATCH /:id/join', () => {
    it('joins the calling User to a Scene', async () => {
      testSession = session(app);
      await testSession
        .post('/login')
        .set('Host', `bayshoreambulance.${process.env.BASE_HOST}`)
        .send({ email: 'third@peakresponse.net', password: 'abcd1234' })
        .expect(HttpStatus.OK);

      const scene = await models.Scene.findByPk('25db9094-03a5-4267-8314-bead229eff9d');
      assert.deepStrictEqual(scene.respondersCount, 2);

      await testSession
        .patch(`/api/scenes/25db9094-03a5-4267-8314-bead229eff9d/join`)
        .set('Host', `bayshoreambulance.${process.env.BASE_HOST}`)
        .expect(HttpStatus.OK);
      await scene.reload();
      assert.deepStrictEqual(scene.respondersCount, 3);
    });
  });

  describe('PATCH /:id/leave', () => {
    it('marks the calling User as departed from a Scene', async () => {
      testSession = session(app);
      await testSession
        .post('/login')
        .set('Host', `bayshoreambulance.${process.env.BASE_HOST}`)
        .send({ email: 'bayshore@peakresponse.net', password: 'abcd1234' })
        .expect(HttpStatus.OK);

      const responder = await models.Responder.findOne({
        where: {
          sceneId: '25db9094-03a5-4267-8314-bead229eff9d',
          userId: '9c5f542e-f7b0-497d-91ed-1eeefd8ade7f',
        },
      });
      assert.deepStrictEqual(responder.departedAt, null);

      await testSession
        .patch(`/api/scenes/25db9094-03a5-4267-8314-bead229eff9d/leave`)
        .set('Host', `bayshoreambulance.${process.env.BASE_HOST}`)
        .expect(HttpStatus.OK);
      await responder.reload();
      assert(responder.departedAt);
    });
  });

  describe('POST /:id/pins', () => {
    it('adds a new Scene Pin', async () => {
      const response = await testSession
        .post(`/api/scenes/25db9094-03a5-4267-8314-bead229eff9d/pins`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          id: 'a2f24a47-6f6b-41be-b40c-cbc7a89ebc12',
          type: 'TRIAGE',
          lat: '37.767087',
          lng: '-122.419977',
        })
        .expect(HttpStatus.OK);
      assert.deepStrictEqual(response.body.id, 'a2f24a47-6f6b-41be-b40c-cbc7a89ebc12');
    });
  });

  describe('DELETE /:id/pins/:pinId', () => {
    it('marks deleted a Scene Pin', async () => {
      const pin = await models.ScenePin.findByPk('7ce4ac99-e05f-4f7d-bb5f-65da4cac8a53', { rejectOnEmpty: true });
      assert.deepStrictEqual(pin.deletedAt, null);

      await testSession
        .delete(`/api/scenes/25db9094-03a5-4267-8314-bead229eff9d/pins/7ce4ac99-e05f-4f7d-bb5f-65da4cac8a53`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send()
        .expect(HttpStatus.NO_CONTENT);

      await pin.reload();
      assert(pin.deletedAt);
      assert.deepStrictEqual(pin.deletedById, 'ffc7a312-50ba-475f-b10f-76ce793dc62a');
      assert.deepStrictEqual(pin.deletedByAgencyId, '9eeb6591-12f8-4036-8af8-6b235153d444');
    });
  });

  describe('PATCH /:id/transfer', () => {
    it('transfers incident command for a Scene', async () => {
      await testSession
        .patch(`/api/scenes/25db9094-03a5-4267-8314-bead229eff9d/transfer`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          userId: '9c5f542e-f7b0-497d-91ed-1eeefd8ade7f',
          agencyId: '81b433cd-5f48-4458-87f3-0bf4e1591830',
        })
        .expect(HttpStatus.OK);
      const scene = await models.Scene.findByPk('25db9094-03a5-4267-8314-bead229eff9d');
      assert(scene);
      assert(scene.incidentCommanderId, '9c5f542e-f7b0-497d-91ed-1eeefd8ade7f');
      assert(scene.incidentCommanderAgencyId, '81b433cd-5f48-4458-87f3-0bf4e1591830');
    });
  });

  describe('PATCH /:id', () => {
    it('updates a scene', async () => {
      const response = await testSession
        .patch(`/api/scenes/25db9094-03a5-4267-8314-bead229eff9d`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          name: 'Updated Scene',
        })
        .expect(HttpStatus.OK);
      assert.deepStrictEqual(response.body?.id, '25db9094-03a5-4267-8314-bead229eff9d');
      const scene = await models.Scene.findByPk(response.body.id);
      assert(scene);
      assert.deepStrictEqual(scene.name, 'Updated Scene');

      const observations = await scene.getObservations({
        order: [['updatedAt', 'DESC']],
      });
      assert.deepStrictEqual(observations.length, 2);
      assert.deepStrictEqual(observations[0].name, 'Updated Scene');
      assert.deepStrictEqual(observations[0].updatedAttributes, ['name']);
    });
  });
});
