const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Assignment', () => {
    beforeEach(async () => {
      await helpers.loadFixtures([
        'users',
        'cities',
        'states',
        'agencies',
        'vehicles',
        'assignments',
        'contacts',
        'employments',
        'scenes',
        'responders',
      ]);
    });

    describe('assign()', () => {
      it('creates a new Assignment', async () => {
        const user = await models.User.findByPk('8e6753e2-3063-48e1-af22-cea57bd06514');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const vehicle = await models.Vehicle.findByPk('91986460-5a12-426d-9855-93227b47ead5');
        const assignment = await models.Assignment.assign(user, agency, user, vehicle);
        assert(assignment);
        assert.deepStrictEqual(assignment.userId, user.id);
        assert.deepStrictEqual(assignment.vehicleId, vehicle.id);
      });

      it('creates a new null Assignment', async () => {
        const user = await models.User.findByPk('8e6753e2-3063-48e1-af22-cea57bd06514');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const assignment = await models.Assignment.assign(user, agency, user, null);
        assert(assignment);
        assert.deepStrictEqual(assignment.userId, user.id);
        assert.deepStrictEqual(assignment.vehicleId, null);
      });

      it('returns an existing assignment if unchanged', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const vehicle = await models.Vehicle.findByPk('4d71fd4a-ef2b-4a0c-aa11-214b5f54f8f7');

        const priorAssignment = await user.getCurrentAssignment();
        assert(priorAssignment);

        const assignment = await models.Assignment.assign(user, agency, user, vehicle);
        assert.deepStrictEqual(assignment.id, priorAssignment.id);
      });

      it('ends a prior Assignment on creation', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const vehicle = await models.Vehicle.findByPk('91986460-5a12-426d-9855-93227b47ead5');

        let priorAssignment = await user.getCurrentAssignment();
        assert(priorAssignment);
        assert(priorAssignment.vehicleId !== vehicle.id);
        assert(priorAssignment.endedAt === null);

        const assignment = await models.Assignment.assign(user, agency, user, vehicle);

        priorAssignment = await models.Assignment.findByPk(priorAssignment.id);
        assert(priorAssignment.endedAt !== null);

        await user.reload();
        const currentAssignment = await user.getCurrentAssignment();
        assert.deepStrictEqual(currentAssignment.id, assignment.id);
        assert.deepStrictEqual(currentAssignment.vehicleId, vehicle.id);
      });
    });
  });
});
