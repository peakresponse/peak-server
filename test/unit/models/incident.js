const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Incident', () => {
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
        'dispatches',
      ]);
    });

    describe('paginate', () => {
      it('filters records by dispatched agency', async () => {
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const { docs, pages, total } = await models.Incident.paginate('Agency', agency);
        assert.deepStrictEqual(docs.length, 1);
        assert.deepStrictEqual(pages, 1);
        assert.deepStrictEqual(total, 1);
      });
    });
  });
});
