const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');

describe('/api/scenes', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures(['users', 'states', 'agencies', 'contacts', 'employments', 'scenes', 'scenePins', 'responders']);
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
      await testSession
        .post('/api/scenes')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          id: '7f263c9d-5304-4c44-9cce-47b1b3743cdd',
          canonicalId: '75c66bf2-b11a-46fa-9b5c-bffdfb8c58d3',
          name: 'New Scene',
        })
        .expect(HttpStatus.CREATED);

      const scene = await models.Scene.findByPk('75c66bf2-b11a-46fa-9b5c-bffdfb8c58d3');
      assert(scene);
      assert.deepStrictEqual(scene.name, 'New Scene');
      assert(scene.isActive);

      const versions = await scene.getVersions();
      assert.deepStrictEqual(versions.length, 1);
      assert.deepStrictEqual(versions[0].id, '7f263c9d-5304-4c44-9cce-47b1b3743cdd');
      assert.deepStrictEqual(versions[0].name, 'New Scene');
      assert.deepStrictEqual(versions[0].updatedAttributes, [
        'id',
        'canonicalId',
        'name',
        'incidentCommanderId',
        'incidentCommanderAgencyId',
      ]);
    });
  });

  describe('PATCH /', () => {
    it('updates a scene', async () => {
      await testSession
        .patch(`/api/scenes`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          id: 'ea025d22-f219-491e-9eb5-d7445abdd902',
          parentId: 'a3486aa2-fc71-41c8-9db8-a28f30c48b2a',
          name: 'Updated Scene',
        })
        .expect(HttpStatus.OK);

      const scene = await models.Scene.findByPk('25db9094-03a5-4267-8314-bead229eff9d');
      assert(scene);
      assert.deepStrictEqual(scene.name, 'Updated Scene');

      const versions = await scene.getVersions({
        order: [['updatedAt', 'DESC']],
      });
      assert.deepStrictEqual(versions.length, 2);
      assert.deepStrictEqual(versions[0].name, 'Updated Scene');
      assert.deepStrictEqual(versions[0].updatedAttributes, ['id', 'parentId', 'name']);
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
});
