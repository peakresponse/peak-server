const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Scene', () => {
    beforeEach(async () => {
      await helpers.loadFixtures([
        'users',
        'states',
        'agencies',
        'contacts',
        'employments',
        'scenes',
        'sceneObservations',
        'responders',
      ]);
    });

    describe("scope('active')", () => {
      it('filters out closed scenes', async () => {
        const scenes = await models.Scene.scope('active').findAll();
        assert.deepStrictEqual(scenes.length, 1);
        assert.deepStrictEqual(
          scenes[0].id,
          '25db9094-03a5-4267-8314-bead229eff9d'
        );
      });
    });

    describe("scope('closed')", () => {
      it('filters out active scenes', async () => {
        const scenes = await models.Scene.scope('closed').findAll();
        assert.deepStrictEqual(scenes.length, 1);
        assert.deepStrictEqual(
          scenes[0].id,
          '7b8ddcc3-63e6-4e6e-a47e-d553289912d1'
        );
      });
    });

    describe('start()', () => {
      it('creates a new Scene', async () => {
        const user = await models.User.findByPk(
          'ffc7a312-50ba-475f-b10f-76ce793dc62a'
        );
        const agency = await models.Agency.findByPk(
          '9eeb6591-12f8-4036-8af8-6b235153d444'
        );
        const scene = await models.Scene.start(user, agency, {
          name: 'New Scene',
        });
        assert(scene);
        assert(scene.id);
        assert.deepStrictEqual(scene.name, 'New Scene');
        assert.deepStrictEqual(scene.respondersCount, 1);
        assert.deepStrictEqual(scene.incidentCommanderId, user.id);
        assert.deepStrictEqual(scene.incidentCommanderAgencyId, agency.id);
        assert.deepStrictEqual(scene.closedAt, null);

        const observations = await scene.getObservations();
        assert.deepStrictEqual(observations.length, 1);
        assert.deepStrictEqual(observations[0].name, 'New Scene');
        assert.deepStrictEqual(observations[0].updatedAttributes, ['name']);

        const responders = await scene.getResponders();
        assert.deepStrictEqual(responders.length, 1);
        assert.deepStrictEqual(responders[0].sceneId, scene.id);
        assert.deepStrictEqual(responders[0].userId, user.id);
        assert.deepStrictEqual(responders[0].agencyId, agency.id);
      });
    });

    describe('close()', () => {
      it('closes a Scene by the Incident Commander', async () => {
        const scene = await models.Scene.findByPk(
          '25db9094-03a5-4267-8314-bead229eff9d'
        );
        assert(scene);
        assert.deepStrictEqual(scene.closedAt, null);

        await scene.close();
        await scene.reload();
        assert(scene.closedAt);

        const observations = await scene.getObservations({
          order: [['created_at', 'DESC']],
        });
        assert.deepStrictEqual(observations.length, 2);
        assert.deepStrictEqual(observations[0].updatedAttributes, ['closedAt']);
        assert.deepStrictEqual(observations[0].closedAt, scene.closedAt);
      });
    });

    describe('join()', () => {
      it('adds a responder to a Scene', async () => {
        const user = await models.User.findByPk(
          '6f4a1b45-b465-4ec9-8127-292d87d7952b'
        );
        const agency = await models.Agency.findByPk(
          '81b433cd-5f48-4458-87f3-0bf4e1591830'
        );
        const scene = await models.Scene.findByPk(
          '25db9094-03a5-4267-8314-bead229eff9d'
        );
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
        const user = await models.User.findByPk(
          '9c5f542e-f7b0-497d-91ed-1eeefd8ade7f'
        );
        const agency = await models.Agency.findByPk(
          '81b433cd-5f48-4458-87f3-0bf4e1591830'
        );
        const scene = await models.Scene.findByPk(
          '25db9094-03a5-4267-8314-bead229eff9d'
        );

        const responder = await scene.leave(user, agency);
        assert(responder);
        assert(responder.departedAt);
      });

      it('prevents marking the current incident commander as departed', async () => {
        const user = await models.User.findByPk(
          'ffc7a312-50ba-475f-b10f-76ce793dc62a'
        );
        const agency = await models.Agency.findByPk(
          '9eeb6591-12f8-4036-8af8-6b235153d444'
        );
        const scene = await models.Scene.findByPk(
          '25db9094-03a5-4267-8314-bead229eff9d'
        );

        await assert.rejects(scene.leave(user, agency));
      });
    });

    describe('transferCommandTo()', () => {
      it('records the Incident Commander transfering command to another User/Agency', async () => {
        const prevUser = await models.User.findByPk(
          'ffc7a312-50ba-475f-b10f-76ce793dc62a'
        );
        const prevAgency = await models.Agency.findByPk(
          '9eeb6591-12f8-4036-8af8-6b235153d444'
        );
        const user = await models.User.findByPk(
          '9c5f542e-f7b0-497d-91ed-1eeefd8ade7f'
        );
        const agency = await models.Agency.findByPk(
          '81b433cd-5f48-4458-87f3-0bf4e1591830'
        );
        const scene = await models.Scene.findByPk(
          '25db9094-03a5-4267-8314-bead229eff9d'
        );
        assert(scene);
        assert(scene.incidentCommanderId, prevUser.id);
        assert(scene.incidentCommanderAgencyId, prevAgency.id);

        await scene.transferCommandTo(user, agency);
        await scene.reload();
        assert.deepStrictEqual(scene.incidentCommanderId, user.id);
        assert.deepStrictEqual(scene.incidentCommanderAgencyId, agency.id);
        const observations = await scene.getObservations({
          order: [['created_at', 'DESC']],
        });
        assert.deepStrictEqual(observations.length, 2);
        assert.deepStrictEqual(observations[0].updatedAttributes, [
          'incidentCommanderId',
          'incidentCommanderAgencyId',
        ]);
        assert.deepStrictEqual(observations[0].incidentCommanderId, user.id);
        assert.deepStrictEqual(
          observations[0].incidentCommanderAgencyId,
          agency.id
        );
        assert.deepStrictEqual(observations[0].createdById, prevUser.id);
        assert.deepStrictEqual(
          observations[0].createdByAgencyId,
          prevAgency.id
        );
      });
    });
  });
});
