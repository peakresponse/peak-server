const assert = require('assert');
const moment = require('moment');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Dispatch', () => {
    beforeEach(async () => {
      await helpers.loadFixtures([
        'states',
        'counties',
        'cities',
        'users',
        'agencies',
        'employments',
        'psaps',
        'dispatchers',
        'scenes',
        'incidents',
        'vehicles',
      ]);
    });

    describe('createOrUpdate()', () => {
      it('creates a new canonical and corresponding history Dispatch record', async () => {
        const user = await models.User.findByPk('4ca8b1a0-e981-4ef0-88d2-6c9f69f0414c');
        const now = moment().toISOString();
        const dispatch = await models.Dispatch.createOrUpdate(user, null, {
          id: 'ce9151bf-090c-45c6-80ff-a0c17ba26065',
          canonicalId: '399c6daf-66db-4845-8fbf-2930477b7e61',
          incidentId: '6621202f-ca09-4ad9-be8f-b56346d1de65',
          vehicleId: '4d71fd4a-ef2b-4a0c-aa11-214b5f54f8f7',
          dispatchedAt: now,
        });
        assert(dispatch);
        assert.deepStrictEqual(dispatch.id, 'ce9151bf-090c-45c6-80ff-a0c17ba26065');
      });
    });
  });
});
