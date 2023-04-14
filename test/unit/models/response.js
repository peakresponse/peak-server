const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Response', () => {
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
        'responses',
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
            'eResponse.AgencyGroup': {
              'eResponse.01': {
                _text: 'S07-50120',
              },
            },
            'eResponse.03': {
              _text: '12345',
            },
            'eResponse.04': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eResponse.ServiceGroup': {
              'eResponse.05': {
                _text: '2205001',
              },
            },
            'eResponse.07': {
              _text: '2207015',
            },
            'eResponse.08': {
              _text: '2208013',
            },
            'eResponse.09': {
              _text: '2209011',
            },
            'eResponse.10': {
              _text: '2210017',
            },
            'eResponse.11': {
              _text: '2211011',
            },
            'eResponse.12': {
              _text: '2212015',
            },
            'eResponse.13': {
              _text: '88',
            },
            'eResponse.14': {
              _text: '88',
            },
            'eResponse.23': {
              _text: '2223001',
            },
            'eResponse.24': {
              _text: '2224019',
            },
          },
        };
        const [record, created] = await models.Response.createOrUpdate(user, agency, data);
        assert(record);
        assert(created);
        assert.deepStrictEqual(record.id, data.id);
        assert.deepStrictEqual(record.parentId, null);
        assert.deepStrictEqual(record.canonicalId, data.canonicalId);
        assert.deepStrictEqual(record.data, data.data);
        assert(record.isValid);
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'canonicalId', 'data']);
        assert.deepStrictEqual(record.updatedDataAttributes, [
          '/eResponse.AgencyGroup',
          '/eResponse.03',
          '/eResponse.04',
          '/eResponse.ServiceGroup',
          '/eResponse.07',
          '/eResponse.08',
          '/eResponse.09',
          '/eResponse.10',
          '/eResponse.11',
          '/eResponse.12',
          '/eResponse.13',
          '/eResponse.14',
          '/eResponse.23',
          '/eResponse.24',
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
          id: '9d903767-a2b9-43a0-9e36-632ac56368f6',
          parentId: '50c74d8a-60c3-42af-a2ed-1a12a42f2b69',
          data_patch: [
            {
              op: 'remove',
              path: '/eResponse.04/_attributes',
            },
            {
              op: 'add',
              path: '/eResponse.04/_text',
              value: '12345-1',
            },
          ],
        };
        const [record, created] = await models.Response.createOrUpdate(user, agency, data);
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
        assert.deepStrictEqual(record.data['eResponse.04']._text, '12345-1');
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'parentId', 'data']);
        assert.deepStrictEqual(record.updatedDataAttributes, ['/eResponse.04']);

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
