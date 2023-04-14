const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Time', () => {
    beforeEach(async () => {
      await helpers.loadFixtures([
        'states',
        'counties',
        'cities',
        'users',
        'psaps',
        'nemsisStateDataSets',
        'agencies',
        'versions',
        'employments',
        'times',
      ]);
    });

    describe('createOrUpdate()', () => {
      it('creates a new canonical and corresponding history record', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const data = {
          id: '133e8e37-47ba-4290-b26e-29083734a173',
          canonicalId: 'ded5a54b-d9ef-480f-8fa9-355c8d8ddb13',
          data: {
            'eTimes.01': {
              _text: '2020-04-06T21:22:10-00:00',
            },
            'eTimes.03': {
              _text: '2020-04-06T21:22:10-00:00',
            },
            'eTimes.05': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eTimes.06': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eTimes.07': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eTimes.09': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eTimes.11': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eTimes.12': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eTimes.13': {
              _text: '2020-04-06T21:22:10-00:00',
            },
          },
        };
        const [record, created] = await models.Time.createOrUpdate(user, agency, data);
        assert(record);
        assert(created);
        assert.deepStrictEqual(record.id, data.id);
        assert.deepStrictEqual(record.parentId, null);
        assert.deepStrictEqual(record.canonicalId, data.canonicalId);
        assert.deepStrictEqual(record.data, data.data);
        assert(record.isValid);
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'canonicalId', 'data']);
        assert.deepStrictEqual(record.updatedDataAttributes, [
          '/eTimes.01',
          '/eTimes.03',
          '/eTimes.05',
          '/eTimes.06',
          '/eTimes.07',
          '/eTimes.09',
          '/eTimes.11',
          '/eTimes.12',
          '/eTimes.13',
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
          id: 'e20c1d21-1dfe-4d5c-8eb2-d46f4f7b6004',
          parentId: '4ee8a6ae-53eb-424f-bec7-bfe702c6d801',
          data_patch: [
            {
              op: 'remove',
              path: '/eTimes.05/_attributes',
            },
            {
              op: 'add',
              path: '/eTimes.05/_text',
              value: '2020-04-06T21:22:10-00:00',
            },
          ],
        };
        const [record, created] = await models.Time.createOrUpdate(user, agency, data);
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
        assert.deepStrictEqual(record.data['eTimes.05']._text, '2020-04-06T21:22:10-00:00');
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'parentId', 'data']);
        assert.deepStrictEqual(record.updatedDataAttributes, ['/eTimes.05']);

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
