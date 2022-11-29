const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Disposition', () => {
    beforeEach(async () => {
      await helpers.loadFixtures([
        'cities',
        'counties',
        'states',
        'users',
        'facilities',
        'psaps',
        'agencies',
        'employments',
        'dispositions',
      ]);
    });

    describe('createOrUpdate()', () => {
      it('creates a new canonical and corresponding history record', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const data = {
          id: '81644523-5425-411e-8366-321c832114cb',
          canonicalId: '8b06e675-86be-4a68-a901-c627e1d1b44c',
          data: {
            'eDisposition.DestinationGroup': {
              'eDisposition.05': {
                _text: '06',
              },
              'eDisposition.06': {
                _text: '06075',
              },
              'eDisposition.07': {
                _text: '94103',
              },
            },
            'eDisposition.IncidentDispositionGroup': {
              'eDisposition.27': {
                _text: '4227001',
              },
              'eDisposition.28': {
                _text: '4228001',
              },
              'eDisposition.29': {
                _text: '4229003',
              },
              'eDisposition.30': {
                _text: '4230005',
              },
            },
            'eDisposition.16': {
              _text: '4216005',
            },
            'eDisposition.17': {
              _text: '4217003',
            },
            'eDisposition.18': {
              _text: '4218015',
            },
            'eDisposition.19': {
              _text: '4219005',
            },
            'eDisposition.20': {
              _text: '4220001',
            },
            'eDisposition.21': {
              _text: '4221003',
            },
            'eDisposition.22': {
              _attributes: {
                NV: '7701001',
                'xsi:nil': 'true',
              },
            },
            'eDisposition.23': {
              _text: '9908007',
            },
            'eDisposition.HospitalTeamActivationGroup': {
              'eDisposition.24': {
                _attributes: {
                  NV: '7701003',
                  'xsi:nil': 'true',
                },
              },
              'eDisposition.25': {
                _attributes: {
                  NV: '7701003',
                  'xsi:nil': 'true',
                },
              },
            },
            'eDisposition.32': {
              _text: '4232001',
            },
          },
        };
        const [record, created] = await models.Disposition.createOrUpdate(user, agency, data);
        assert(record);
        assert(created);
        assert.deepStrictEqual(record.id, data.id);
        assert.deepStrictEqual(record.parentId, null);
        assert.deepStrictEqual(record.canonicalId, data.canonicalId);
        assert.deepStrictEqual(record.data, data.data);
        assert(record.isValid);
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'canonicalId', 'data']);
        assert.deepStrictEqual(record.updatedDataAttributes, [
          '/eDisposition.DestinationGroup',
          '/eDisposition.IncidentDispositionGroup',
          '/eDisposition.16',
          '/eDisposition.17',
          '/eDisposition.18',
          '/eDisposition.19',
          '/eDisposition.20',
          '/eDisposition.21',
          '/eDisposition.22',
          '/eDisposition.23',
          '/eDisposition.HospitalTeamActivationGroup',
          '/eDisposition.32',
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
          id: '0f110d19-6c45-49ca-81b3-76ad5743040e',
          parentId: '4f996971-6588-4f86-ac22-85d4eba146ff',
          data_patch: [
            {
              op: 'add',
              path: '/eDisposition.DestinationGroup/eDisposition.07/_text',
              value: '94107',
            },
          ],
        };
        const [record, created] = await models.Disposition.createOrUpdate(user, agency, data);
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
        assert.deepStrictEqual(record.data['eDisposition.DestinationGroup']['eDisposition.07']._text, '94107');
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'parentId', 'data']);
        assert.deepStrictEqual(record.updatedDataAttributes, ['/eDisposition.DestinationGroup/eDisposition.07']);

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
