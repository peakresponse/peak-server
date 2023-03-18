const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Version', () => {
    beforeEach(async () => {
      await helpers.loadFixtures(['users', 'states', 'counties', 'cities', 'psaps', 'agencies', 'versions', 'employments']);
    });

    describe('.name', () => {
      it('returns a unique display name that includes its creation date', async () => {
        const version = await models.Version.findByPk('c680282e-8756-4b02-82f3-2437c22ecade');
        assert.deepStrictEqual(version.name, '2020-04-06-c680282e87564b0282f32437c22ecade');
      });
    });
  });
});
