const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Situation', () => {
    beforeEach(async () => {
      await helpers.loadFixtures([
        'states',
        'counties',
        'cities',
        'users',
        'psaps',
        'nemsisStateDataSets',
        'nemsisSchematrons',
        'agencies',
        'versions',
        'employments',
        'situations',
      ]);
    });

    describe('createOrUpdate()', () => {
      it('creates a new canonical and corresponding history record', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const data = {
          id: 'e399588a-e024-498c-96d6-ba1ab102a9b6',
          canonicalId: '0d8f4649-baa4-424d-9adf-da1048e60b74',
          data: {
            'eSituation.01': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': true,
              },
            },
            'eSituation.02': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': true,
              },
            },
            'eSituation.07': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': true,
              },
            },
            'eSituation.08': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': true,
              },
            },
            'eSituation.09': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': true,
              },
            },
            'eSituation.10': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': true,
              },
            },
            'eSituation.11': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': true,
              },
            },
            'eSituation.12': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': true,
              },
            },
            'eSituation.13': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': true,
              },
            },
            'eSituation.18': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': true,
              },
            },
            'eSituation.20': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': true,
              },
            },
          },
        };
        const [record, created] = await models.Situation.createOrUpdate(user, agency, data);
        assert(record);
        assert(created);
        assert.deepStrictEqual(record.id, data.id);
        assert.deepStrictEqual(record.parentId, null);
        assert.deepStrictEqual(record.canonicalId, data.canonicalId);
        assert.deepStrictEqual(record.data, data.data);
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'canonicalId', 'data']);
        assert.deepStrictEqual(record.updatedDataAttributes, [
          '/eSituation.01',
          '/eSituation.02',
          '/eSituation.07',
          '/eSituation.08',
          '/eSituation.09',
          '/eSituation.10',
          '/eSituation.11',
          '/eSituation.12',
          '/eSituation.13',
          '/eSituation.18',
          '/eSituation.20',
        ]);
        assert.deepStrictEqual(record.createdById, user.id);
        assert.deepStrictEqual(record.updatedById, user.id);
        assert.deepStrictEqual(record.createdByAgencyId, agency.id);
        assert.deepStrictEqual(record.updatedByAgencyId, agency.id);

        const canonical = await record.getCanonical();
        assert(canonical);
        assert.deepStrictEqual(canonical.id, data.canonicalId);
        assert.deepStrictEqual(canonical.parentId, null);
        assert.deepStrictEqual(canonical.canonicalId, null);
        assert.deepStrictEqual(canonical.data, data.data);
        assert.deepStrictEqual(canonical.createdById, user.id);
        assert.deepStrictEqual(canonical.updatedById, user.id);
        assert.deepStrictEqual(canonical.createdByAgencyId, agency.id);
        assert.deepStrictEqual(canonical.updatedByAgencyId, agency.id);
      });

      it('updates an existing canonical record and creates a corresponding history record', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const data = {
          id: 'c3818dc9-f245-47aa-bd2f-b8891941a577',
          parentId: 'd7b842f4-383e-4eb3-9e5f-353eac2d6e9b',
          data_patch: [
            {
              op: 'remove',
              path: '/eSituation.01/_attributes',
            },
            {
              op: 'add',
              path: '/eSituation.01/_text',
              value: '2020-04-06T21:22:10-00:00',
            },
          ],
        };
        const [record, created] = await models.Situation.createOrUpdate(user, agency, data);
        assert(record);
        assert(!created);
        assert.deepStrictEqual(record.id, data.id);
        assert.deepStrictEqual(record.parentId, data.parentId);
        const parent = await record.getParent();
        assert.deepStrictEqual(record.canonicalId, parent.canonicalId);
        assert.deepStrictEqual(record.createdById, parent.createdById);
        assert.deepStrictEqual(record.updatedById, user.id);
        assert.deepStrictEqual(record.createdByAgencyId, parent.createdByAgencyId);
        assert.deepStrictEqual(record.updatedByAgencyId, agency.id);
        assert.deepStrictEqual(record.data['eSituation.01']._text, '2020-04-06T21:22:10-00:00');
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'parentId', 'data']);
        assert.deepStrictEqual(record.updatedDataAttributes, ['/eSituation.01']);

        const canonical = await record.getCanonical();
        assert.deepStrictEqual(canonical.parentId, null);
        assert.deepStrictEqual(canonical.canonicalId, null);
        assert.deepStrictEqual(canonical.createdById, record.createdById);
        assert.deepStrictEqual(canonical.updatedById, record.updatedById);
        assert.deepStrictEqual(canonical.createdByAgencyId, record.createdByAgencyId);
        assert.deepStrictEqual(canonical.updatedByAgencyId, record.updatedByAgencyId);
        assert.deepStrictEqual(canonical.data, record.data);
      });
    });
  });
});
