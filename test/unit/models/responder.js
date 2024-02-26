const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Responder', () => {
    beforeEach(async () => {
      await helpers.loadFixtures([
        'users',
        'cities',
        'states',
        'counties',
        'psaps',
        'nemsisStateDataSets',
        'nemsisSchematrons',
        'agencies',
        'versions',
        'vehicles',
        'contacts',
        'employments',
        'scenes',
        'responders',
      ]);
    });

    describe('.toJSON()', () => {
      it('returns the base JSON representation of a record', async () => {
        const responder = await models.Responder.findByPk('2cad101c-11c4-4552-84b3-b47881a5cb02');
        assert(responder);
        const json = responder.toJSON();
        assert.deepStrictEqual(JSON.parse(JSON.stringify(json)), {
          id: '2cad101c-11c4-4552-84b3-b47881a5cb02',
          sceneId: '7b8ddcc3-63e6-4e6e-a47e-d553289912d1',
          userId: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          agencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
          vehicleId: '4d71fd4a-ef2b-4a0c-aa11-214b5f54f8f7',
          agencyName: null,
          unitNumber: null,
          capability: null,
          arrivedAt: '2020-04-06T21:22:10.102Z',
          departedAt: null,
          createdById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          updatedById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          createdByAgencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
          updatedByAgencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
          createdAt: '2020-04-06T21:22:10.102Z',
          updatedAt: JSON.parse(JSON.stringify(responder.updatedAt)), // updatedAt gets overwritten during fixture load
        });
      });
    });
  });
});
