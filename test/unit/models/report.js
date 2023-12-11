const assert = require('assert');
const fs = require('fs-extra');
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

    describe('nemsisValidate()', () => {
      it('validates the NEMSIS EMS DataSet XML', async () => {
        const report = await models.Report.findByPk('4a7b8b77-b7c2-4338-8508-eeb98fb8d3ed');
        await report.regenerate();
        await report.nemsisValidate();
        assert.deepStrictEqual(report.isValid, true);
      });
    });

    describe('regenerate()', () => {
      it('generates NEMSIS EMS DataSet XML', async () => {
        const report = await models.Report.findByPk('4a7b8b77-b7c2-4338-8508-eeb98fb8d3ed');
        // attach a fixture to the File referenced by this report
        const tmpFile = helpers.uploadFile('testing123.mp4');
        const file = await models.File.findByPk('8e693fb6-7f2a-4cc8-9d5f-d8eb5915bb60');
        await file.update({ file: tmpFile });
        assert(fs.pathExistsSync(path.resolve(__dirname, `../../../public/assets/test/files/${file.id}/file`, tmpFile)));
        await report.regenerate();
        await helpers.cleanUploadedAssets();
        assert.deepStrictEqual(
          report.emsDataSet,
          `<EMSDataSet xmlns="http://www.nemsis.org" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.nemsis.org https://nemsis.org/media/nemsis_v3/3.5.0.211008CP3/XSDs/NEMSIS_XSDs/EMSDataSet_v3.xsd">
	<Header>
		<DemographicGroup>
			<dAgency.01>S07-50120</dAgency.01>
			<dAgency.02>S07-50120</dAgency.02>
			<dAgency.04>06</dAgency.04>
		</DemographicGroup>
		<PatientCareReport UUID="4a7b8b77-b7c2-4338-8508-eeb98fb8d3ed">
			<eRecord>
				<eRecord.01>4a7b8b77-b7c2-4338-8508-eeb98fb8d3ed</eRecord.01>
				<eRecord.SoftwareApplicationGroup>
					<eRecord.02>Peak Response Inc.</eRecord.02>
					<eRecord.03>Peak Response</eRecord.03>
					<eRecord.04>${pkg.version}</eRecord.04>
				</eRecord.SoftwareApplicationGroup>
			</eRecord>
			<eResponse>
				<eResponse.AgencyGroup>
					<eResponse.01>S07-50120</eResponse.01>
				</eResponse.AgencyGroup>
				<eResponse.03>12345</eResponse.03>
				<eResponse.04 NV="7701003" xsi:nil="true"/>
				<eResponse.ServiceGroup>
					<eResponse.05>2205001</eResponse.05>
				</eResponse.ServiceGroup>
				<eResponse.07>2207015</eResponse.07>
				<eResponse.08>2208013</eResponse.08>
				<eResponse.09>2209011</eResponse.09>
				<eResponse.10>2210017</eResponse.10>
				<eResponse.11>2211011</eResponse.11>
				<eResponse.12>2212015</eResponse.12>
				<eResponse.13>50</eResponse.13>
				<eResponse.14>50</eResponse.14>
				<eResponse.23>2223001</eResponse.23>
				<eResponse.24>2224019</eResponse.24>
			</eResponse>
			<eDispatch>
				<eDispatch.01>2301051</eDispatch.01>
				<eDispatch.02 NV="7701003" xsi:nil="true"/>
			</eDispatch>
			<eTimes>
				<eTimes.01>2020-04-06T21:22:10-00:00</eTimes.01>
				<eTimes.03>2020-04-06T21:22:10-00:00</eTimes.03>
				<eTimes.05 NV="7701003" xsi:nil="true"/>
				<eTimes.06 NV="7701003" xsi:nil="true"/>
				<eTimes.07 NV="7701003" xsi:nil="true"/>
				<eTimes.09 NV="7701003" xsi:nil="true"/>
				<eTimes.11 NV="7701003" xsi:nil="true"/>
				<eTimes.12 NV="7701003" xsi:nil="true"/>
				<eTimes.13>2020-04-06T21:22:10-00:00</eTimes.13>
			</eTimes>
			<ePatient>
				<ePatient.PatientNameGroup>
					<ePatient.02>Jones</ePatient.02>
					<ePatient.03>David</ePatient.03>
				</ePatient.PatientNameGroup>
				<ePatient.07 NV="7701003" xsi:nil="true"/>
				<ePatient.08 NV="7701003" xsi:nil="true"/>
				<ePatient.09 NV="7701003" xsi:nil="true"/>
				<ePatient.13 NV="7701003" xsi:nil="true"/>
				<ePatient.14 NV="7701003" xsi:nil="true"/>
				<ePatient.AgeGroup>
					<ePatient.15>18</ePatient.15>
					<ePatient.16 NV="7701003" xsi:nil="true"/>
				</ePatient.AgeGroup>
			</ePatient>
			<ePayment>
				<ePayment.01 NV="7701003" xsi:nil="true"/>
				<ePayment.50 NV="7701003" xsi:nil="true"/>
			</ePayment>
			<eScene>
				<eScene.01 NV="7701003" xsi:nil="true"/>
				<eScene.06 NV="7701003" xsi:nil="true"/>
				<eScene.07 NV="7701003" xsi:nil="true"/>
				<eScene.08 NV="7701003" xsi:nil="true"/>
				<eScene.09 NV="7701003" xsi:nil="true"/>
				<eScene.17>2411786</eScene.17>
				<eScene.18>06</eScene.18>
				<eScene.19 NV="7701003" xsi:nil="true"/>
				<eScene.21 NV="7701003" xsi:nil="true"/>
			</eScene>
			<eSituation>
				<eSituation.01 NV="7701003" xsi:nil="true"/>
				<eSituation.02 NV="7701003" xsi:nil="true"/>
				<eSituation.07 NV="7701003" xsi:nil="true"/>
				<eSituation.08 NV="7701003" xsi:nil="true"/>
				<eSituation.09 NV="7701003" xsi:nil="true"/>
				<eSituation.10 NV="7701003" xsi:nil="true"/>
				<eSituation.11 NV="7701003" xsi:nil="true"/>
				<eSituation.12 NV="7701003" xsi:nil="true"/>
				<eSituation.13 NV="7701003" xsi:nil="true"/>
				<eSituation.18 NV="7701003" xsi:nil="true"/>
				<eSituation.20 NV="7701003" xsi:nil="true"/>
			</eSituation>
			<eInjury>
				<eInjury.01 NV="7701003" xsi:nil="true"/>
				<eInjury.03 NV="7701003" xsi:nil="true"/>
				<eInjury.04 NV="7701003" xsi:nil="true"/>
			</eInjury>
			<eArrest>
				<eArrest.01 NV="7701003" xsi:nil="true"/>
				<eArrest.02 NV="7701003" xsi:nil="true"/>
				<eArrest.03 NV="7701003" xsi:nil="true"/>
				<eArrest.04 NV="7701003" xsi:nil="true"/>
				<eArrest.07 NV="7701003" xsi:nil="true"/>
				<eArrest.09 NV="7701003" xsi:nil="true"/>
				<eArrest.11 NV="7701003" xsi:nil="true"/>
				<eArrest.12 NV="7701003" xsi:nil="true"/>
				<eArrest.14 NV="7701003" xsi:nil="true"/>
				<eArrest.16 NV="7701003" xsi:nil="true"/>
				<eArrest.17 NV="7701003" xsi:nil="true"/>
				<eArrest.18 NV="7701003" xsi:nil="true"/>
				<eArrest.20 NV="7701003" xsi:nil="true"/>
				<eArrest.21 NV="7701003" xsi:nil="true"/>
				<eArrest.22 NV="7701003" xsi:nil="true"/>
			</eArrest>
			<eHistory>
				<eHistory.01>3101009</eHistory.01>
				<eHistory.17 PN="8801015" xsi:nil="true"/>
			</eHistory>
			<eNarrative>
				<eNarrative.01>This is a test narrative</eNarrative.01>
			</eNarrative>
			<eVitals>
				<eVitals.VitalGroup>
					<eVitals.01>2020-04-06T21:22:10-00:00</eVitals.01>
					<eVitals.02>9923001</eVitals.02>
					<eVitals.CardiacRhythmGroup>
						<eVitals.03 NV="7701003" xsi:nil="true"/>
						<eVitals.04 NV="7701003" xsi:nil="true"/>
						<eVitals.05 NV="7701003" xsi:nil="true"/>
					</eVitals.CardiacRhythmGroup>
					<eVitals.BloodPressureGroup>
						<eVitals.06 NV="7701003" xsi:nil="true"/>
					</eVitals.BloodPressureGroup>
					<eVitals.HeartRateGroup>
						<eVitals.10 NV="7701003" xsi:nil="true"/>
					</eVitals.HeartRateGroup>
					<eVitals.12 NV="7701003" xsi:nil="true"/>
					<eVitals.14 NV="7701003" xsi:nil="true"/>
					<eVitals.16 NV="7701003" xsi:nil="true"/>
					<eVitals.18 NV="7701003" xsi:nil="true"/>
					<eVitals.GlasgowScoreGroup>
						<eVitals.19 NV="7701003" xsi:nil="true"/>
						<eVitals.20 NV="7701003" xsi:nil="true"/>
						<eVitals.21 NV="7701003" xsi:nil="true"/>
						<eVitals.22 NV="7701003" xsi:nil="true"/>
					</eVitals.GlasgowScoreGroup>
					<eVitals.26 NV="7701003" xsi:nil="true"/>
					<eVitals.PainScaleGroup>
						<eVitals.27 NV="7701003" xsi:nil="true"/>
					</eVitals.PainScaleGroup>
					<eVitals.StrokeScaleGroup>
						<eVitals.29 NV="7701003" xsi:nil="true"/>
						<eVitals.30 NV="7701003" xsi:nil="true"/>
					</eVitals.StrokeScaleGroup>
					<eVitals.31 NV="7701003" xsi:nil="true"/>
				</eVitals.VitalGroup>
			</eVitals>
			<eProtocols>
				<eProtocols.ProtocolGroup>
					<eProtocols.01 NV="7701003" xsi:nil="true"/>
				</eProtocols.ProtocolGroup>
			</eProtocols>
			<eMedications>
				<eMedications.MedicationGroup>
					<eMedications.01>2020-04-06T21:22:10-00:00</eMedications.01>
					<eMedications.02 NV="7701003" xsi:nil="true"/>
					<eMedications.03 NV="7701003" xsi:nil="true"/>
					<eMedications.04 NV="7701003" xsi:nil="true"/>
					<eMedications.DosageGroup>
						<eMedications.05 NV="7701003" xsi:nil="true"/>
						<eMedications.06 NV="7701003" xsi:nil="true"/>
					</eMedications.DosageGroup>
					<eMedications.07 NV="7701003" xsi:nil="true"/>
					<eMedications.08 NV="7701003" xsi:nil="true"/>
					<eMedications.10 NV="7701003" xsi:nil="true"/>
				</eMedications.MedicationGroup>
			</eMedications>
			<eProcedures>
				<eProcedures.ProcedureGroup>
					<eProcedures.01>2020-04-06T21:22:10-00:00</eProcedures.01>
					<eProcedures.02 NV="7701003" xsi:nil="true"/>
					<eProcedures.03 NV="7701003" xsi:nil="true"/>
					<eProcedures.05 NV="7701003" xsi:nil="true"/>
					<eProcedures.06 NV="7701003" xsi:nil="true"/>
					<eProcedures.07 NV="7701003" xsi:nil="true"/>
					<eProcedures.08 NV="7701003" xsi:nil="true"/>
					<eProcedures.10 NV="7701003" xsi:nil="true"/>
				</eProcedures.ProcedureGroup>
			</eProcedures>
			<eDisposition>
				<eDisposition.DestinationGroup>
					<eDisposition.05>06</eDisposition.05>
					<eDisposition.06>06075</eDisposition.06>
					<eDisposition.07>94103</eDisposition.07>
				</eDisposition.DestinationGroup>
				<eDisposition.IncidentDispositionGroup>
					<eDisposition.27>4227001</eDisposition.27>
					<eDisposition.28>4228001</eDisposition.28>
					<eDisposition.29>4229003</eDisposition.29>
					<eDisposition.30>4230005</eDisposition.30>
				</eDisposition.IncidentDispositionGroup>
				<eDisposition.16>4216005</eDisposition.16>
				<eDisposition.17>4217003</eDisposition.17>
				<eDisposition.18>4218015</eDisposition.18>
				<eDisposition.19>4219005</eDisposition.19>
				<eDisposition.20>4220001</eDisposition.20>
				<eDisposition.21>4221003</eDisposition.21>
				<eDisposition.22 NV="7701001" xsi:nil="true"/>
				<eDisposition.23>9908007</eDisposition.23>
				<eDisposition.HospitalTeamActivationGroup>
					<eDisposition.24 NV="7701003" xsi:nil="true"/>
					<eDisposition.25 NV="7701003" xsi:nil="true"/>
				</eDisposition.HospitalTeamActivationGroup>
				<eDisposition.32>4232001</eDisposition.32>
			</eDisposition>
			<eOutcome>
				<eOutcome.01 NV="7701003" xsi:nil="true"/>
				<eOutcome.02 NV="7701003" xsi:nil="true"/>
				<eOutcome.EmergencyDepartmentProceduresGroup>
					<eOutcome.09 NV="7701003" xsi:nil="true"/>
					<eOutcome.19 NV="7701003" xsi:nil="true"/>
				</eOutcome.EmergencyDepartmentProceduresGroup>
				<eOutcome.10 NV="7701003" xsi:nil="true"/>
				<eOutcome.11 NV="7701003" xsi:nil="true"/>
				<eOutcome.HospitalProceduresGroup>
					<eOutcome.12 NV="7701003" xsi:nil="true"/>
					<eOutcome.20 NV="7701003" xsi:nil="true"/>
				</eOutcome.HospitalProceduresGroup>
				<eOutcome.13 NV="7701003" xsi:nil="true"/>
				<eOutcome.16 NV="7701003" xsi:nil="true"/>
				<eOutcome.18 NV="7701003" xsi:nil="true"/>
			</eOutcome>
		</PatientCareReport>
	</Header>
</EMSDataSet>`
        );
      });
    });
  });
});
