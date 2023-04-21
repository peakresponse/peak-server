const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Procedure', () => {
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
        'procedures',
      ]);
    });

    describe('createOrUpdate()', () => {
      it('creates a new canonical and corresponding history record', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const data = {
          id: 'adcb351f-a9fd-4876-a0ce-714fccb3f929',
          canonicalId: 'd032e180-ea0a-4f36-9df1-4da3e17f4908',
          data: {
            'eProcedures.01': {
              _text: '2020-04-06T21:22:10-00:00',
            },
            'eProcedures.02': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eProcedures.03': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eProcedures.05': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eProcedures.06': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eProcedures.07': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eProcedures.08': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eProcedures.10': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
          },
        };
        const [record, created] = await models.Procedure.createOrUpdate(user, agency, data);
        assert(record);
        assert(created);
        assert.deepStrictEqual(record.id, data.id);
        assert.deepStrictEqual(record.parentId, null);
        assert.deepStrictEqual(record.canonicalId, data.canonicalId);
        assert.deepStrictEqual(record.data, data.data);
        assert(record.isValid);
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'canonicalId', 'data']);
        assert.deepStrictEqual(record.updatedDataAttributes, [
          '/eProcedures.01',
          '/eProcedures.02',
          '/eProcedures.03',
          '/eProcedures.05',
          '/eProcedures.06',
          '/eProcedures.07',
          '/eProcedures.08',
          '/eProcedures.10',
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
          id: 'a6ccbcad-2f35-4d9e-bfdb-83802cb2b7ad',
          parentId: '34a48aed-3a58-4dad-aa6e-4cc4d4f5efc0',
          data_patch: [
            {
              op: 'remove',
              path: '/eProcedures.02/_attributes',
            },
            {
              op: 'add',
              path: '/eProcedures.02/_text',
              value: '9923001',
            },
          ],
        };
        const [record, created] = await models.Procedure.createOrUpdate(user, agency, data);
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
        assert.deepStrictEqual(record.data['eProcedures.02']._text, '9923001');
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'parentId', 'data']);
        assert.deepStrictEqual(record.updatedDataAttributes, ['/eProcedures.02']);

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
