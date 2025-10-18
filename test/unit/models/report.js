const assert = require('assert');
const fs = require('fs/promises');
const path = require('path');

const helpers = require('../../helpers');
const models = require('../../../models');
const pkg = require('../../../package.json');

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
        'nemsisSchematrons',
        'regions',
        'agencies',
        'versions',
        'venues',
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
        assert.deepStrictEqual(report.priority, models.Patient.Priority.DECEASED);
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
        assert.deepStrictEqual(report.priority, models.Patient.Priority.DECEASED);
        assert.deepStrictEqual(report.filterPriority, models.Patient.Priority.TRANSPORTED);
      });

      it('returns DELETED if Report is soft-deleted', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        // soft-delete the Report by setting deletedAt
        await models.Report.createOrUpdate(user, agency, {
          id: '447d3625-744c-4622-b20f-3305c4093811',
          parentId: 'c19bb731-5e9e-4feb-9192-720782ecf9a8',
          deletedAt: new Date().toISOString(),
        });
        // now check canonical record
        const report = await models.Report.findByPk('9242e8de-9d22-457f-96c8-00a43dfc1f3a', {
          include: ['disposition', 'patient'],
        });
        assert.deepStrictEqual(report.priority, models.Patient.Priority.DECEASED);
        assert.deepStrictEqual(report.filterPriority, models.Patient.Priority.DELETED);
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
        const incident = await models.Incident.findByPk('6621202f-ca09-4ad9-be8f-b56346d1de65');
        assert.deepStrictEqual(incident.reportsCount, 2);
        const scene = await incident.getScene();
        assert.deepStrictEqual(scene.patientsCount, 2);
        assert.deepStrictEqual(scene.priorityPatientsCounts, [1, 0, 0, 0, 1, 0]);

        const data = {
          id: '7bd5e011-8948-4498-93e3-a212272662bb',
          canonicalId: 'aace1af0-aeaf-4020-acca-dbeb7e3295e8',
          incidentId: '6621202f-ca09-4ad9-be8f-b56346d1de65',
          patientId: '1b76259b-d08e-45d2-ba62-983880ef2e4e',
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
          createdAt: '2023-04-06T21:23:10.102Z',
          updatedAt: '2023-04-06T21:23:10.102Z',
        };

        const [record, created] = await models.Report.createOrUpdate(user, agency, data);
        assert(record);
        assert(created);
        await record.reload();
        assert.deepStrictEqual(record.id, data.id);
        assert.deepStrictEqual(record.parentId, null);
        assert.deepStrictEqual(record.canonicalId, data.canonicalId);
        assert.deepStrictEqual(record.data, data.data);
        assert.deepStrictEqual(record.updatedAttributes, [
          'id',
          'canonicalId',
          'createdAt',
          'updatedAt',
          'incidentId',
          'data',
          'patientId',
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
        assert.deepStrictEqual(record.createdAt.toISOString(), '2023-04-06T21:23:10.102Z');
        assert.deepStrictEqual(record.updatedAt.toISOString(), '2023-04-06T21:23:10.102Z');

        await incident.reload();
        assert.deepStrictEqual(incident.reportsCount, 3);

        await scene.reload();
        assert.deepStrictEqual(scene.patientsCount, 3);
        assert.deepStrictEqual(scene.priorityPatientsCounts, [2, 0, 0, 0, 1, 0]);

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
        assert.deepStrictEqual(canonical.createdAt.toISOString(), '2023-04-06T21:23:10.102Z');
        assert.deepStrictEqual(canonical.updatedAt.toISOString(), '2023-04-06T21:23:10.102Z');

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
          updatedAt: '2023-04-06T21:23:10.102Z',
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
        await record.reload();
        assert.deepStrictEqual(record.id, data.id);
        assert.deepStrictEqual(record.parentId, data.parentId);
        const parent = await record.getParent();
        assert.deepStrictEqual(record.canonicalId, parent.canonicalId);
        assert.deepStrictEqual(record.createdById, parent.createdById);
        assert.deepStrictEqual(record.updatedById, user.id);
        assert.deepStrictEqual(record.updatedAt.toISOString(), '2023-04-06T21:23:10.102Z');
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
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'parentId', 'updatedAt', 'data']);
        assert.deepStrictEqual(record.updatedDataAttributes, ['/eRecord.SoftwareApplicationGroup/eRecord.04']);

        const canonical = await record.getCanonical();
        assert.deepStrictEqual(canonical.parentId, null);
        assert.deepStrictEqual(canonical.canonicalId, null);
        assert.deepStrictEqual(canonical.createdById, record.createdById);
        assert.deepStrictEqual(canonical.updatedById, record.updatedById);
        assert.deepStrictEqual(canonical.updatedAt, record.updatedAt);
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

    describe('toIntegrationJSON()', () => {
      it('returns a JSON object of the Report in integration payload format', async () => {
        const report = await models.Report.findByPk('4a7b8b77-b7c2-4338-8508-eeb98fb8d3ed', {
          include: ['patient', 'disposition', 'response', 'incident'],
        });
        const json = JSON.parse(JSON.stringify(report.toIntegrationJSON()));
        assert.deepStrictEqual(json, {
          id: '4a7b8b77-b7c2-4338-8508-eeb98fb8d3ed',
          incidentNumber: '12345678',
          patientAge: 18,
          patientAgeUnits: '2516009',
          patientGender: '9906003',
          patientName: 'David Jones',
          pin: '123456',
          unit: '50',
          createdAt: '2020-04-06T21:22:10.102Z',
          deletedAt: null,
          updatedAt: json.updatedAt,
        });
      });
    });

    describe('nemsisValidate()', () => {
      it('validates the NEMSIS EMS DataSet XML', async () => {
        const report = await models.Report.findByPk('4a7b8b77-b7c2-4338-8508-eeb98fb8d3ed');
        await report.regenerate();
        await report.nemsisValidate();
        // canonical record runs the regeneration and validation on the current instance
        const current = await report.getCurrent();
        assert.deepStrictEqual(current.isValid, true);
      });
    });

    describe('regenerate()', () => {
      it('generates NEMSIS EMS DataSet XML', async () => {
        const report = await models.Report.findByPk('4a7b8b77-b7c2-4338-8508-eeb98fb8d3ed');
        // attach a fixture to the File referenced by this report
        const tmpFile = await helpers.uploadFile('512x512.png');
        const file = await models.File.findByPk('8e693fb6-7f2a-4cc8-9d5f-d8eb5915bb60');
        await file.update({ file: tmpFile });
        assert(await helpers.assetPathExists(path.join('files', file.id, 'file', tmpFile)));
        // regenerate the report ems data set xml
        await report.regenerate();
        // since this is the canonical record, it will regenerate the "current" version
        const current = await models.Report.unscoped().findByPk(report.currentId);
        // assert that the emsDataSet field exists, without inserted files for efficiency in handling/validation
        let compare;
        compare = await fs.readFile(path.resolve(__dirname, '../../fixtures/files/4a7b8b77-b7c2-4338-8508-eeb98fb8d3ed.before.xml'));
        compare = compare.toString();
        compare = compare.replace('<eRecord.04></eRecord.04>', `<eRecord.04>${pkg.version}</eRecord.04>`);
        compare = compare.replace('<eOther.22></eOther.22>', `<eOther.22>${tmpFile}</eOther.22>`);
        assert.deepStrictEqual(current.emsDataSet, compare);
        // assert that the full xml attachment exists with inserted file
        assert(current.emsDataSetFile);
        assert(await helpers.assetPathExists(path.join('reports', current.id, 'ems-data-set-file', current.emsDataSetFile)));
        const downloadedFilePath = await current.downloadAssetFile('emsDataSetFile');
        const test = await fs.readFile(downloadedFilePath);
        compare = await fs.readFile(path.resolve(__dirname, '../../fixtures/files/4a7b8b77-b7c2-4338-8508-eeb98fb8d3ed.after.xml'));
        compare = compare.toString();
        compare = compare.replace('<eRecord.04></eRecord.04>', `<eRecord.04>${pkg.version}</eRecord.04>`);
        compare = compare.replace('<eOther.22></eOther.22>', `<eOther.22>${tmpFile}</eOther.22>`);
        assert.deepStrictEqual(test.toString(), compare);
        await helpers.cleanUploadedAssets();
        await fs.unlink(downloadedFilePath);
      });
    });
  });
});
