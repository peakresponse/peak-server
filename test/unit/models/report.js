const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Report', () => {
    beforeEach(async () => {
      await helpers.loadFixtures([
        'states',
        'counties',
        'cities',
        'psaps',
        'users',
        'agencies',
        'employments',
        'scenes',
        'incidents',
        'responses',
        'times',
        'situations',
        'dispositions',
        'histories',
        'narratives',
        'medications',
        'procedures',
        'vitals',
        'reports',
      ]);
    });

    describe('createOrUpdate()', () => {
      it('validates that the id is correct for a canonical record', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');

        const data = {
          id: '7bd5e011-8948-4498-93e3-a212272662bb',
          canonicalId: 'aace1af0-aeaf-4020-acca-dbeb7e3295e8',
          data: {
            'eRecord.01': {
              _text: 'eaa2867a-c814-444a-ae6b-35674efdbfc2',
            },
            'eRecord.SoftwareApplicationGroup': {
              'eRecord.02': {
                _text: 'Peak Response Inc',
              },
              'eRecord.03': {
                _text: 'Peak Response',
              },
              'eRecord.04': {
                _text: 'Unit test version',
              },
            },
          },
        };
        assert.rejects(models.Report.createOrUpdate(user, agency, data));
      });

      it('creates a new canonical and corresponding history record', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');

        const data = {
          id: '7bd5e011-8948-4498-93e3-a212272662bb',
          canonicalId: 'aace1af0-aeaf-4020-acca-dbeb7e3295e8',
          incidentId: '6621202f-ca09-4ad9-be8f-b56346d1de65',
          medicationIds: ['6f43bc3d-1d4e-470a-9568-0c8b50c8281e'],
          procedureIds: ['34a48aed-3a58-4dad-aa6e-4cc4d4f5efc0'],
          vitalIds: ['2036119d-4545-4452-a26f-b9ec6a1a323b'],
          data: {
            'eRecord.01': {
              _text: 'aace1af0-aeaf-4020-acca-dbeb7e3295e8',
            },
            'eRecord.SoftwareApplicationGroup': {
              'eRecord.02': {
                _text: 'Peak Response Inc',
              },
              'eRecord.03': {
                _text: 'Peak Response',
              },
              'eRecord.04': {
                _text: 'Unit test version',
              },
            },
          },
        };
        const [record, created] = await models.Report.createOrUpdate(user, agency, data);
        assert(record);
        assert(created);
        assert.deepStrictEqual(record.id, data.id);
        assert.deepStrictEqual(record.parentId, null);
        assert.deepStrictEqual(record.canonicalId, data.canonicalId);
        assert.deepStrictEqual(record.data, data.data);
        assert(record.isValid);
        assert.deepStrictEqual(record.updatedAttributes, [
          'id',
          'canonicalId',
          'incidentId',
          'data',
          'medicationIds',
          'vitalIds',
          'procedureIds',
        ]);
        assert.deepStrictEqual(record.medicationIds, ['6f43bc3d-1d4e-470a-9568-0c8b50c8281e']);
        assert.deepStrictEqual(record.procedureIds, ['34a48aed-3a58-4dad-aa6e-4cc4d4f5efc0']);
        assert.deepStrictEqual(record.vitalIds, ['2036119d-4545-4452-a26f-b9ec6a1a323b']);
        assert.deepStrictEqual(record.updatedDataAttributes, ['/eRecord.01', '/eRecord.SoftwareApplicationGroup']);
        assert.deepStrictEqual(record.createdById, user.id);
        assert.deepStrictEqual(record.updatedById, user.id);
        assert.deepStrictEqual(record.createdByAgencyId, agency.id);
        assert.deepStrictEqual(record.updatedByAgencyId, agency.id);

        const incident = await record.getIncident();
        assert.deepStrictEqual(incident.reportsCount, 2);

        let medications = await record.getMedications();
        assert(medications.length, 1);
        assert(medications[0].id, '6f43bc3d-1d4e-470a-9568-0c8b50c8281e');

        let procedures = await record.getProcedures();
        assert(procedures.length, 1);
        assert(procedures[0].id, '34a48aed-3a58-4dad-aa6e-4cc4d4f5efc0');

        let vitals = await record.getVitals();
        assert(vitals.length, 1);
        assert(vitals[0].id, '2036119d-4545-4452-a26f-b9ec6a1a323b');

        const canonical = await record.getCanonical();
        assert(canonical);
        assert.deepStrictEqual(canonical.id, data.canonicalId);
        assert.deepStrictEqual(canonical.parentId, null);
        assert.deepStrictEqual(canonical.canonicalId, null);
        assert.deepStrictEqual(canonical.medicationIds, ['6f43bc3d-1d4e-470a-9568-0c8b50c8281e']);
        assert.deepStrictEqual(canonical.procedureIds, ['34a48aed-3a58-4dad-aa6e-4cc4d4f5efc0']);
        assert.deepStrictEqual(canonical.vitalIds, ['2036119d-4545-4452-a26f-b9ec6a1a323b']);
        assert.deepStrictEqual(canonical.data, data.data);
        assert.deepStrictEqual(canonical.createdById, user.id);
        assert.deepStrictEqual(canonical.updatedById, user.id);
        assert.deepStrictEqual(canonical.createdByAgencyId, agency.id);
        assert.deepStrictEqual(canonical.updatedByAgencyId, agency.id);

        medications = await canonical.getMedications();
        assert(medications.length, 1);
        assert(medications[0].id, '6f43bc3d-1d4e-470a-9568-0c8b50c8281e');

        procedures = await canonical.getProcedures();
        assert(procedures.length, 1);
        assert(procedures[0].id, '34a48aed-3a58-4dad-aa6e-4cc4d4f5efc0');

        vitals = await canonical.getVitals();
        assert(vitals.length, 1);
        assert(vitals[0].id, '2036119d-4545-4452-a26f-b9ec6a1a323b');
      });

      it('updates an existing canonical record and creates a corresponding history record', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const data = {
          id: '748e785e-fae0-4c9b-924b-06372b060705',
          parentId: 'c19bb731-5e9e-4feb-9192-720782ecf9a8',
          data_patch: [
            {
              op: 'replace',
              path: '/eRecord.SoftwareApplicationGroup/eRecord.04/_text',
              value: 'Unit test version 2',
            },
          ],
        };
        const [record, created] = await models.Report.createOrUpdate(user, agency, data);
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
        assert.deepStrictEqual(record.data, {
          'eRecord.01': {
            _text: '9242e8de-9d22-457f-96c8-00a43dfc1f3a',
          },
          'eRecord.SoftwareApplicationGroup': {
            'eRecord.02': {
              _text: 'Peak Response Inc',
            },
            'eRecord.03': {
              _text: 'Peak Response',
            },
            'eRecord.04': {
              _text: 'Unit test version 2',
            },
          },
        });
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'parentId', 'data']);
        assert.deepStrictEqual(record.updatedDataAttributes, ['/eRecord.SoftwareApplicationGroup/eRecord.04']);

        const canonical = await record.getCanonical();
        assert.deepStrictEqual(canonical.parentId, null);
        assert.deepStrictEqual(canonical.canonicalId, null);
        assert.deepStrictEqual(canonical.createdById, record.createdById);
        assert.deepStrictEqual(canonical.updatedById, record.updatedById);
        assert.deepStrictEqual(canonical.createdByAgencyId, record.createdByAgencyId);
        assert.deepStrictEqual(canonical.updatedByAgencyId, record.updatedByAgencyId);
        assert.deepStrictEqual(canonical.data, record.data);
      });

      it('creates a new canonical record branching off of the specified parent', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const data = {
          id: '748e785e-fae0-4c9b-924b-06372b060705',
          canonicalId: 'b5155f81-58f7-48b7-94eb-5ac6b5021a80',
          parentId: 'c19bb731-5e9e-4feb-9192-720782ecf9a8',
          data_patch: [
            {
              op: 'replace',
              path: '/eRecord.01/_text',
              value: 'b5155f81-58f7-48b7-94eb-5ac6b5021a80',
            },
            {
              op: 'replace',
              path: '/eRecord.SoftwareApplicationGroup/eRecord.04/_text',
              value: 'Unit test version 2',
            },
          ],
        };
        const [record, created] = await models.Report.createOrUpdate(user, agency, data);
        assert(record);
        assert(created);
        assert.deepStrictEqual(record.id, data.id);
        assert.deepStrictEqual(record.parentId, data.parentId);
        const parent = await record.getParent();
        assert.notDeepStrictEqual(record.canonicalId, parent.canonicalId);

        const canonical = await record.getCanonical();
        assert(canonical.isCanonical);
        assert.deepStrictEqual(canonical.parentId, parent.id);
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
