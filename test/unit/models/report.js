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
        'nemsisStateDataSets',
        'agencies',
        'versions',
        'facilities',
        'employments',
        'scenes',
        'patients',
        'incidents',
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
        'signatures',
        'vitals',
        'reports',
      ]);
    });

    describe('filterPriority', () => {
      it('returns the patient priority if not transported', async () => {
        const report = await models.Report.findByPk('9242e8de-9d22-457f-96c8-00a43dfc1f3a', {
          include: ['disposition', 'patient'],
        });
        assert.deepStrictEqual(report.filterPriority, models.Patient.Priority.DECEASED);
      });

      it('returns TRANSPORTED if destination facility set', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        // update the disposition to include a destination facility
        const [disposition] = await models.Disposition.createOrUpdate(user, agency, {
          id: '90cd241e-ae36-4344-8e57-1d33f1057744',
          parentId: '4f996971-6588-4f86-ac22-85d4eba146ff',
          destinationFacilityId: '23a7e241-4486-40fb-babb-aaa4c060c659',
        });
        // update the report with the new disposition record
        await models.Report.createOrUpdate(user, agency, {
          id: 'b8861c9e-a4e3-4322-bc33-750cd5b6081a',
          parentId: 'c19bb731-5e9e-4feb-9192-720782ecf9a8',
          dispositionId: disposition.id,
        });
        // now check canonical record
        const report = await models.Report.findByPk('9242e8de-9d22-457f-96c8-00a43dfc1f3a', {
          include: ['disposition', 'patient'],
        });
        assert.deepStrictEqual(report.filterPriority, models.Patient.Priority.TRANSPORTED);
      });
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
        await assert.rejects(models.Report.createOrUpdate(user, agency, data));
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
        assert.deepStrictEqual(incident.reportsCount, 3);

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

    describe('createPayload()', () => {
      it('generates a JSON payload of all dependencies for a list of Reports', async () => {
        const report = await models.Report.findByPk('4a7b8b77-b7c2-4338-8508-eeb98fb8d3ed', {
          include: [
            'response',
            { model: models.Scene, as: 'scene', include: ['city', 'state'] },
            'time',
            'patient',
            'situation',
            'history',
            { model: models.Disposition, as: 'disposition', include: ['destinationFacility'] },
            'narrative',
            'medications',
            'procedures',
            'vitals',
            'files',
            { model: models.Signature, as: 'signatures', include: ['form'] },
          ],
        });
        const payload = await models.Report.createPayload([report]);
        assert.deepStrictEqual(payload, {
          City: [report.scene.city.toJSON()],
          Disposition: [report.disposition.toJSON()],
          Facility: [report.disposition.destinationFacility.toJSON()],
          File: report.files.map((m) => m.toJSON()),
          Form: [report.signatures[0].form.toJSON()],
          History: [report.history.toJSON()],
          Medication: report.medications.map((m) => m.toJSON()),
          Narrative: [report.narrative.toJSON()],
          Patient: [report.patient.toJSON()],
          Procedure: report.procedures.map((m) => m.toJSON()),
          Report: [report.toJSON()],
          Response: [report.response.toJSON()],
          Scene: [report.scene.toJSON()],
          Signature: report.signatures.map((s) => s.toJSON()),
          Situation: [report.situation.toJSON()],
          State: [report.scene.state.toJSON()],
          Time: [report.time.toJSON()],
          Vital: report.vitals.map((m) => m.toJSON()),
        });
      });
    });
  });
});
