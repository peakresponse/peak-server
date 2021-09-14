const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Scene', () => {
    beforeEach(async () => {
      await helpers.loadFixtures(['users', 'states', 'agencies', 'contacts', 'employments', 'scenes', 'responders']);
    });

    describe("scope('active')", () => {
      it('filters out closed scenes', async () => {
        const scenes = await models.Scene.scope('canonical', 'active').findAll();
        assert.deepStrictEqual(scenes.length, 1);
        assert.deepStrictEqual(scenes[0].id, '25db9094-03a5-4267-8314-bead229eff9d');
      });
    });

    describe("scope('closed')", () => {
      it('filters out active scenes', async () => {
        const scenes = await models.Scene.scope('canonical', 'closed').findAll();
        assert.deepStrictEqual(scenes.length, 1);
        assert.deepStrictEqual(scenes[0].id, '7b8ddcc3-63e6-4e6e-a47e-d553289912d1');
      });
    });

    describe('start()', () => {
      it('creates a new Scene', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const [scene, created] = await models.Scene.start(user, agency, {
          id: 'fef7d4da-28e7-4423-9975-624eb2d11275',
          canonicalId: '69928e17-c8fb-47db-8597-5591b8dda33a',
          name: 'New Scene',
        });
        assert(scene);
        assert(created);
        assert.deepStrictEqual(scene.id, 'fef7d4da-28e7-4423-9975-624eb2d11275');
        assert.deepStrictEqual(scene.name, 'New Scene');
        assert.deepStrictEqual(scene.incidentCommanderId, user.id);
        assert.deepStrictEqual(scene.incidentCommanderAgencyId, agency.id);
        assert.deepStrictEqual(scene.closedAt, null);

        const canonical = await scene.getCanonical();
        assert(canonical);
        assert.deepStrictEqual(canonical.currentId, 'fef7d4da-28e7-4423-9975-624eb2d11275');
        assert.deepStrictEqual(canonical.id, '69928e17-c8fb-47db-8597-5591b8dda33a');
        assert.deepStrictEqual(canonical.respondersCount, 1);

        const versions = await canonical.getVersions();
        assert.deepStrictEqual(versions.length, 1);
        assert.deepStrictEqual(versions[0].name, 'New Scene');
        assert.deepStrictEqual(versions[0].updatedAttributes, [
          'id',
          'canonicalId',
          'name',
          'incidentCommanderId',
          'incidentCommanderAgencyId',
        ]);

        const responders = await canonical.getResponders();
        assert.deepStrictEqual(responders.length, 1);
        assert.deepStrictEqual(responders[0].sceneId, scene.canonicalId);
        assert.deepStrictEqual(responders[0].userId, user.id);
        assert.deepStrictEqual(responders[0].agencyId, agency.id);
      });
    });

    describe('close()', () => {
      it('closes a Scene by the Incident Commander', async () => {
        const scene = await models.Scene.findByPk('25db9094-03a5-4267-8314-bead229eff9d');
        assert(scene);
        assert.deepStrictEqual(scene.closedAt, null);

        const user = await scene.getIncidentCommander();
        const agency = await scene.getIncidentCommanderAgency();
        await scene.close(user, agency);
        await scene.reload();
        assert(scene.closedAt);

        const versions = await scene.getVersions({
          order: [['updated_at', 'DESC']],
        });
        assert.deepStrictEqual(versions.length, 2);
        assert.deepStrictEqual(versions[0].updatedAttributes, ['id', 'parentId', 'closedAt']);
        assert.deepStrictEqual(versions[0].closedAt, scene.closedAt);
      });
    });

    describe('join()', () => {
      it('adds a responder to a Scene', async () => {
        const user = await models.User.findByPk('6f4a1b45-b465-4ec9-8127-292d87d7952b');
        const agency = await models.Agency.findByPk('81b433cd-5f48-4458-87f3-0bf4e1591830');
        const scene = await models.Scene.findByPk('25db9094-03a5-4267-8314-bead229eff9d');
        assert(scene);
        assert.deepStrictEqual(scene.respondersCount, 2);
        assert.deepStrictEqual((await scene.getResponders()).length, 2);

        const responder = await scene.join(user, agency);
        assert(responder);

        assert.deepStrictEqual(scene.respondersCount, 3);
        assert.deepStrictEqual((await scene.getResponders()).length, 3);

        /// join is idempotent- should just return existing record if joining again
        assert((await scene.join(user, agency)).id, responder.id);
        assert.deepStrictEqual(scene.respondersCount, 3);
        assert.deepStrictEqual((await scene.getResponders()).length, 3);
      });
    });

    describe('leave()', () => {
      it('records a departure of a responder from a Scene', async () => {
        const user = await models.User.findByPk('9c5f542e-f7b0-497d-91ed-1eeefd8ade7f');
        const agency = await models.Agency.findByPk('81b433cd-5f48-4458-87f3-0bf4e1591830');
        const scene = await models.Scene.findByPk('25db9094-03a5-4267-8314-bead229eff9d');
        assert(scene);
        assert.deepStrictEqual(scene.respondersCount, 2);
        assert.deepStrictEqual((await scene.getResponders()).length, 2);

        const responder = await scene.leave(user, agency);
        assert(responder);
        assert(responder.departedAt);

        await scene.reload();
        assert.deepStrictEqual(scene.respondersCount, 1);
        assert.deepStrictEqual((await models.Responder.scope('latest', 'onScene').findAll({ where: { sceneId: scene.id } })).length, 1);
      });

      it('prevents marking the current incident commander as departed', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const scene = await models.Scene.findByPk('25db9094-03a5-4267-8314-bead229eff9d');

        await assert.rejects(scene.leave(user, agency));
      });
    });

    describe('transferCommandTo()', () => {
      it('records the Incident Commander transfering command to another User/Agency', async () => {
        const prevUser = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const prevAgency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const user = await models.User.findByPk('9c5f542e-f7b0-497d-91ed-1eeefd8ade7f');
        const agency = await models.Agency.findByPk('81b433cd-5f48-4458-87f3-0bf4e1591830');
        const scene = await models.Scene.findByPk('25db9094-03a5-4267-8314-bead229eff9d');
        assert(scene);
        assert(scene.incidentCommanderId, prevUser.id);
        assert(scene.incidentCommanderAgencyId, prevAgency.id);

        await scene.transferCommandTo(user, agency);
        await scene.reload();
        assert.deepStrictEqual(scene.incidentCommanderId, user.id);
        assert.deepStrictEqual(scene.incidentCommanderAgencyId, agency.id);
        const versions = await scene.getVersions({
          order: [['updated_at', 'DESC']],
        });
        assert.deepStrictEqual(versions.length, 2);
        assert.deepStrictEqual(versions[0].updatedAttributes, ['id', 'parentId', 'incidentCommanderId', 'incidentCommanderAgencyId']);
        assert.deepStrictEqual(versions[0].incidentCommanderId, user.id);
        assert.deepStrictEqual(versions[0].incidentCommanderAgencyId, agency.id);
        assert.deepStrictEqual(versions[0].createdById, prevUser.id);
        assert.deepStrictEqual(versions[0].createdByAgencyId, prevAgency.id);
      });
    });
  });
});
