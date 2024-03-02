const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Vital', () => {
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
        'versions',
        'employments',
        'vitals',
      ]);
    });

    describe('createOrUpdate()', () => {
      it('creates a new canonical and corresponding history record', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const data = {
          id: '0e7655a8-8cbe-4653-92d0-1ec97e18a00f',
          canonicalId: '38ac16bd-7ed2-4b69-af14-657cc1891131',
          data: {
            'eVitals.01': {
              _text: '2020-04-06T21:22:10-00:00',
            },
            'eVitals.02': {
              _text: '9923001',
            },
            'eVitals.CardiacRhythmGroup': {
              'eVitals.03': {
                _attributes: {
                  NV: '7701003',
                  'xsi:nil': 'true',
                },
              },
              'eVitals.04': {
                _attributes: {
                  NV: '7701003',
                  'xsi:nil': 'true',
                },
              },
              'eVitals.05': {
                _attributes: {
                  NV: '7701003',
                  'xsi:nil': 'true',
                },
              },
            },
            'eVitals.BloodPressureGroup': {
              'eVitals.06': {
                _attributes: {
                  NV: '7701003',
                  'xsi:nil': 'true',
                },
              },
            },
            'eVitals.HeartRateGroup': {
              'eVitals.10': {
                _attributes: {
                  NV: '7701003',
                  'xsi:nil': 'true',
                },
              },
            },
            'eVitals.12': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eVitals.14': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eVitals.16': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eVitals.18': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eVitals.GlasgowScoreGroup': {
              'eVitals.19': {
                _attributes: {
                  NV: '7701003',
                  'xsi:nil': 'true',
                },
              },
              'eVitals.20': {
                _attributes: {
                  NV: '7701003',
                  'xsi:nil': 'true',
                },
              },
              'eVitals.21': {
                _attributes: {
                  NV: '7701003',
                  'xsi:nil': 'true',
                },
              },
              'eVitals.22': {
                _attributes: {
                  NV: '7701003',
                  'xsi:nil': 'true',
                },
              },
            },
            'eVitals.26': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'eVitals.PainScaleGroup': {
              'eVitals.27': {
                _attributes: {
                  NV: '7701003',
                  'xsi:nil': 'true',
                },
              },
            },
            'eVitals.StrokeScaleGroup': {
              'eVitals.29': {
                _attributes: {
                  NV: '7701003',
                  'xsi:nil': 'true',
                },
              },
              'eVitals.30': {
                _attributes: {
                  NV: '7701003',
                  'xsi:nil': 'true',
                },
              },
            },
            'eVitals.31': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
          },
        };
        const [record, created] = await models.Vital.createOrUpdate(user, agency, data);
        assert(record);
        assert(created);
        assert.deepStrictEqual(record.id, data.id);
        assert.deepStrictEqual(record.parentId, null);
        assert.deepStrictEqual(record.canonicalId, data.canonicalId);
        assert.deepStrictEqual(record.data, data.data);
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'canonicalId', 'data']);
        assert.deepStrictEqual(record.updatedDataAttributes, [
          '/eVitals.01',
          '/eVitals.02',
          '/eVitals.CardiacRhythmGroup',
          '/eVitals.BloodPressureGroup',
          '/eVitals.HeartRateGroup',
          '/eVitals.12',
          '/eVitals.14',
          '/eVitals.16',
          '/eVitals.18',
          '/eVitals.GlasgowScoreGroup',
          '/eVitals.26',
          '/eVitals.PainScaleGroup',
          '/eVitals.StrokeScaleGroup',
          '/eVitals.31',
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
          id: 'adcb351f-a9fd-4876-a0ce-714fccb3f929',
          parentId: '2036119d-4545-4452-a26f-b9ec6a1a323b',
          data_patch: [
            {
              op: 'remove',
              path: '/eVitals.26/_attributes',
            },
            {
              op: 'add',
              path: '/eVitals.26/_text',
              value: '3326001',
            },
          ],
        };
        const [record, created] = await models.Vital.createOrUpdate(user, agency, data);
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
        assert.deepStrictEqual(record.data['eVitals.26']._text, '3326001');
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'parentId', 'data']);
        assert.deepStrictEqual(record.updatedDataAttributes, ['/eVitals.26']);

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
