const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Medication', () => {
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
        'medications',
      ]);
    });

    describe('createOrUpdate()', () => {
      it('creates a new canonical and corresponding history record', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const data = {
          id: '2caf42a5-562f-422e-82c0-d31a2f9028cd',
          canonicalId: 'b1ecf012-3279-4105-a82f-944d5666efee',
          data: {
            'eMedications.01': {
              _text: '2020-04-06T21:22:10-00:00',
            },
            'eMedications.02': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eMedications.03': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eMedications.04': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eMedications.DosageGroup': {
              'eMedications.05': {
                _attributes: {
                  NV: '7701003',
                  'xsi:nil': 'true',
                },
              },
              'eMedications.06': {
                _attributes: {
                  NV: '7701003',
                  'xsi:nil': 'true',
                },
              },
            },
            'eMedications.07': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eMedications.08': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eMedications.10': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
          },
        };
        const [record, created] = await models.Medication.createOrUpdate(user, agency, data);
        assert(record);
        assert(created);
        assert.deepStrictEqual(record.id, data.id);
        assert.deepStrictEqual(record.parentId, null);
        assert.deepStrictEqual(record.canonicalId, data.canonicalId);
        assert.deepStrictEqual(record.data, data.data);
        assert(record.isValid);
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'canonicalId', 'data']);
        assert.deepStrictEqual(record.updatedDataAttributes, [
          '/eMedications.01',
          '/eMedications.02',
          '/eMedications.03',
          '/eMedications.04',
          '/eMedications.DosageGroup',
          '/eMedications.07',
          '/eMedications.08',
          '/eMedications.10',
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
          id: '5a7ceb71-222d-4490-90f6-20962f69feca',
          parentId: '6f43bc3d-1d4e-470a-9568-0c8b50c8281e',
          data_patch: [
            {
              op: 'remove',
              path: '/eMedications.02/_attributes',
            },
            {
              op: 'add',
              path: '/eMedications.02/_text',
              value: '9923001',
            },
          ],
        };
        const [record, created] = await models.Medication.createOrUpdate(user, agency, data);
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
        assert.deepStrictEqual(record.data['eMedications.02']._text, '9923001');
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'parentId', 'data']);
        assert.deepStrictEqual(record.updatedDataAttributes, ['/eMedications.02']);

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
