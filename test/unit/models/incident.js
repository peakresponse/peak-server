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
        'psaps',
        'nemsisStateDataSets',
        'nemsisSchematrons',
        'regions',
        'agencies',
        'venues',
        'facilities',
        'versions',
        'employments',
        'dispatchers',
        'scenes',
        'patients',
        'incidents',
        'vehicles',
        'dispatches',
        'responses',
        'times',
        'situations',
        'dispositions',
        'files',
        'forms',
        'histories',
        'narratives',
        'medications',
        'procedures',
        'vitals',
        'reports',
      ]);
    });

    describe('sort', () => {
      it('is set when a digits-only number is set', () => {
        const incident = models.Incident.build();
        incident.number = '12345';
        assert.deepStrictEqual(incident.sort, BigInt(12345));

        incident.number = '12345-001';
        assert.deepStrictEqual(incident.sort, null);

        incident.number = 'abc12d345ad';
        assert.deepStrictEqual(incident.sort, null);
      });
    });

    describe('paginate()', () => {
      it('filters records by dispatched agency', async () => {
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const { docs, pages, total } = await models.Incident.paginate('Agency', agency);
        assert.deepStrictEqual(docs.length, 1);
        assert(docs[0].scene);
        assert(docs[0].scene.city);
        assert(docs[0].scene.state);
        assert(docs[0].dispatches);
        assert.deepStrictEqual(pages, 1);
        assert.deepStrictEqual(total, 1);
      });
    });

    describe('updateReportsCount()', () => {
      it('updates the reportsCount counter cache', async () => {
        const incident = await models.Incident.findByPk('6621202f-ca09-4ad9-be8f-b56346d1de65');
        await incident.update({ reportsCount: 0 });
        await incident.updateReportsCount();
        assert.deepStrictEqual(incident.reportsCount, 2);
      });

      it('excludes deleted Reports', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        // soft-delete the Report by setting deletedAt
        await models.Report.createOrUpdate(user, agency, {
          id: '447d3625-744c-4622-b20f-3305c4093811',
          parentId: 'c19bb731-5e9e-4feb-9192-720782ecf9a8',
          deletedAt: new Date().toISOString(),
        });
        // confirm change in reportsCount
        const incident = await models.Incident.findByPk('6621202f-ca09-4ad9-be8f-b56346d1de65');
        assert.deepStrictEqual(incident.reportsCount, 1);
      });
    });

    describe('updateDispatchedAgencies()', () => {
      it('updates the dispatchedAgencies association', async () => {
        const incident = await models.Incident.findByPk('6621202f-ca09-4ad9-be8f-b56346d1de65');
        await incident.setDispatchedAgencies([]);
        assert.deepStrictEqual(await incident.countDispatchedAgencies(), 0);
        await incident.updateDispatchedAgencies();
        assert.deepStrictEqual(await incident.countDispatchedAgencies(), 1);
      });
    });
  });
});
