const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');

describe('/api/scenes', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'cities',
      'counties',
      'states',
      'psaps',
      'users',
      'nemsisStateDataSets',
      'nemsisSchematrons',
      'regions',
      'agencies',
      'versions',
      'facilities',
      'contacts',
      'employments',
      'dispatchers',
      'scenes',
      'patients',
      'incidents',
      'vehicles',
      'assignments',
      'dispatches',
      'responders',
      'responses',
      'times',
      'situations',
      'dispositions',
      'histories',
      'narratives',
      'medications',
      'vitals',
      'procedures',
      'files',
      'reports',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(StatusCodes.OK);
  });

  describe('GET /', () => {
    it('returns closed scenes', async () => {
      const response = await testSession.get('/api/scenes').set('Host', `bmacc.${process.env.BASE_HOST}`).expect(StatusCodes.OK);
      assert.deepStrictEqual(response.body?.length, 1);
    });
  });

  describe('POST /', () => {
    it('starts an active MCI Scene', async () => {
      await testSession
        .post('/api/scenes')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          Scene: {
            id: '7f263c9d-5304-4c44-9cce-47b1b3743cdd',
            parentId: 'c7e97d09-dc4b-4b4e-963c-b0ba066934c1',
            isMCI: true,
            mgsResponderId: '1ced41c8-8928-46eb-b1e1-31bfa6fb5ac0',
          },
          Responder: {
            id: '1ced41c8-8928-46eb-b1e1-31bfa6fb5ac0',
            sceneId: 'bc69d0d0-1cac-4c11-aa98-7cb1e5e7018c',
            userId: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
            agencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
            arrivedAt: '2020-04-06T21:22:10.102Z',
          },
        })
        .expect(StatusCodes.OK);

      const incident = await models.Incident.findByPk('2e73956f-e009-4e3b-b94d-085acc3f47b2');

      const scene = await incident.getScene();
      assert.deepStrictEqual(scene.id, 'bc69d0d0-1cac-4c11-aa98-7cb1e5e7018c');
      assert(scene.isCanonical);
      assert(scene.isMCI);
      assert(scene.isActive);
      assert.deepStrictEqual(scene.mgsResponderId, '1ced41c8-8928-46eb-b1e1-31bfa6fb5ac0');

      const responders = await scene.getResponders();
      assert.deepStrictEqual(responders.length, 1);
      assert.deepStrictEqual(responders[0].id, '1ced41c8-8928-46eb-b1e1-31bfa6fb5ac0');
    });

    it('creates a new Scene', async () => {
      await testSession
        .post('/api/scenes')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          Responder: {
            id: 'a80254a6-f373-40ac-bc07-17da6a61b2cb',
            sceneId: '75c66bf2-b11a-46fa-9b5c-bffdfb8c58d3',
            userId: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
            agencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
            arrivedAt: '2020-04-06T21:22:10.102Z',
          },
          Scene: {
            id: '7f263c9d-5304-4c44-9cce-47b1b3743cdd',
            canonicalId: '75c66bf2-b11a-46fa-9b5c-bffdfb8c58d3',
            name: 'New Scene',
            isMCI: true,
            mgsResponderId: 'a80254a6-f373-40ac-bc07-17da6a61b2cb',
          },
        })
        .expect(StatusCodes.CREATED);

      const scene = await models.Scene.findByPk('75c66bf2-b11a-46fa-9b5c-bffdfb8c58d3');
      assert(scene);
      assert.deepStrictEqual(scene.name, 'New Scene');
      assert(scene.isMCI);
      assert(scene.isActive);
      assert(scene.mgsResponderId, 'a80254a6-f373-40ac-bc07-17da6a61b2cb');
      assert.deepStrictEqual(scene.respondersCount, 1);

      const versions = await scene.getVersions();
      assert.deepStrictEqual(versions.length, 1);
      assert.deepStrictEqual(versions[0].id, '7f263c9d-5304-4c44-9cce-47b1b3743cdd');
      assert.deepStrictEqual(versions[0].name, 'New Scene');
      assert.deepStrictEqual(versions[0].updatedAttributes, ['id', 'canonicalId', 'name', 'isMCI', 'mgsResponderId']);
    });

    it('adds a new Responder to an existing Scene', async () => {
      await testSession
        .post('/api/scenes')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          Responder: {
            id: 'a80254a6-f373-40ac-bc07-17da6a61b2cb',
            sceneId: '25db9094-03a5-4267-8314-bead229eff9d',
            userId: '6f4a1b45-b465-4ec9-8127-292d87d7952b',
            agencyId: '81b433cd-5f48-4458-87f3-0bf4e1591830',
            arrivedAt: '2020-04-06T21:22:10.102Z',
          },
        })
        .expect(StatusCodes.OK);

      const scene = await models.Scene.findByPk('25db9094-03a5-4267-8314-bead229eff9d');
      assert.deepStrictEqual(scene.respondersCount, 3);

      const responder = await models.Responder.findByPk('a80254a6-f373-40ac-bc07-17da6a61b2cb');
      assert.deepStrictEqual(JSON.stringify(responder?.arrivedAt), '"2020-04-06T21:22:10.102Z"');
    });

    it('adds a new Responder without a User account as enroute to an existing Scene', async () => {
      await testSession
        .post('/api/scenes')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          Responder: {
            id: 'a80254a6-f373-40ac-bc07-17da6a61b2cb',
            sceneId: '25db9094-03a5-4267-8314-bead229eff9d',
            agencyId: '81b433cd-5f48-4458-87f3-0bf4e1591830',
            unitNumber: '64',
            callSign: 'AMB 1',
            capability: '2207015',
          },
        })
        .expect(StatusCodes.OK);

      const scene = await models.Scene.findByPk('25db9094-03a5-4267-8314-bead229eff9d');
      assert.deepStrictEqual(scene.respondersCount, 3);

      const responder = await models.Responder.findByPk('a80254a6-f373-40ac-bc07-17da6a61b2cb');
      assert.deepStrictEqual(responder.agencyId, '81b433cd-5f48-4458-87f3-0bf4e1591830');
      assert.deepStrictEqual(responder.unitNumber, '64');
      assert.deepStrictEqual(responder.callSign, 'AMB 1');
      assert.deepStrictEqual(responder.capability, '2207015');
    });

    it('adds a new Responder without a User account or Agency as enroute to an existing Scene', async () => {
      await testSession
        .post('/api/scenes')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          Responder: {
            id: 'a80254a6-f373-40ac-bc07-17da6a61b2cb',
            sceneId: '25db9094-03a5-4267-8314-bead229eff9d',
            agencyName: 'Unlisted Agency',
            unitNumber: '46',
            callSign: 'AMB 2',
            capability: '2207017',
          },
        })
        .expect(StatusCodes.OK);

      const scene = await models.Scene.findByPk('25db9094-03a5-4267-8314-bead229eff9d');
      assert.deepStrictEqual(scene.respondersCount, 3);

      const responder = await models.Responder.findByPk('a80254a6-f373-40ac-bc07-17da6a61b2cb');
      assert.deepStrictEqual(responder.agencyName, 'Unlisted Agency');
      assert.deepStrictEqual(responder.unitNumber, '46');
      assert.deepStrictEqual(responder.callSign, 'AMB 2');
      assert.deepStrictEqual(responder.capability, '2207017');
    });

    it('returns HTTP 409 Conflict on submitting a duplicate non-User Responder to an existing Scene', async () => {
      await testSession
        .post('/api/scenes')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          Responder: {
            id: 'a80254a6-f373-40ac-bc07-17da6a61b2cb',
            sceneId: '25db9094-03a5-4267-8314-bead229eff9d',
            agencyName: 'Unlisted Agency',
            unitNumber: '46',
            callSign: 'AMB 2',
            capability: '2207017',
          },
        })
        .expect(StatusCodes.OK);

      await testSession
        .post('/api/scenes')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          Responder: {
            id: 'f896b206-3035-4dcd-8fe9-fdc226b8d0ef',
            sceneId: '25db9094-03a5-4267-8314-bead229eff9d',
            agencyName: 'Unlisted Agency',
            unitNumber: '46',
            callSign: 'AMB 2',
            capability: '2207015',
          },
        })
        .expect(StatusCodes.CONFLICT);

      await testSession
        .post('/api/scenes')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          Responder: {
            id: 'f896b206-3035-4dcd-8fe9-fdc226b8d0ef',
            sceneId: '25db9094-03a5-4267-8314-bead229eff9d',
            agencyName: 'Unlisted Agency',
            unitNumber: '46',
            capability: '2207015',
          },
        })
        .expect(StatusCodes.CONFLICT);

      await testSession
        .post('/api/scenes')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          Responder: {
            id: 'f896b206-3035-4dcd-8fe9-fdc226b8d0ef',
            sceneId: '25db9094-03a5-4267-8314-bead229eff9d',
            agencyName: 'Unlisted Agency',
            callSign: 'AMB 2',
            capability: '2207015',
          },
        })
        .expect(StatusCodes.CONFLICT);
    });

    it('changes a Responder role', async () => {
      await testSession
        .post('/api/scenes')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          Responder: {
            id: '1550b568-9a2a-41b5-9c0f-8284f07d1aec',
            role: 'TREATMENT',
          },
        })
        .expect(StatusCodes.OK);

      const responder = await models.Responder.findByPk('1550b568-9a2a-41b5-9c0f-8284f07d1aec');
      assert.deepStrictEqual(responder.role, 'TREATMENT');

      await testSession
        .post('/api/scenes')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          Responder: {
            id: '1550b568-9a2a-41b5-9c0f-8284f07d1aec',
            role: null,
          },
        })
        .expect(StatusCodes.OK);

      await responder.reload();
      assert.deepStrictEqual(responder.role, null);
    });

    it('marks a Responder as having left a Scene', async () => {
      await testSession
        .post('/api/scenes')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          Responder: {
            id: '1550b568-9a2a-41b5-9c0f-8284f07d1aec',
            sceneId: '25db9094-03a5-4267-8314-bead229eff9d',
            userId: '9c5f542e-f7b0-497d-91ed-1eeefd8ade7f',
            agencyId: '81b433cd-5f48-4458-87f3-0bf4e1591830',
            arrivedAt: '2020-04-06T21:32:10.102Z',
            departedAt: '2020-04-06T22:32:10.102Z',
          },
        })
        .expect(StatusCodes.OK);

      const responder = await models.Responder.findByPk('1550b568-9a2a-41b5-9c0f-8284f07d1aec');
      assert.deepStrictEqual(JSON.stringify(responder?.departedAt), '"2020-04-06T22:32:10.102Z"');

      const scene = await models.Scene.findByPk('25db9094-03a5-4267-8314-bead229eff9d');
      assert.deepStrictEqual(scene.respondersCount, 1);
    });
  });
});
