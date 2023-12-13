const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');
const pkg = require('../../../package.json');

describe('/api/reports', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'cities',
      'counties',
      'states',
      'psaps',
      'users',
      'nemsisStateDataSets',
      'nemsisSchematrons',
      'agencies',
      'versions',
      'facilities',
      'contacts',
      'employments',
      'dispatchers',
      'scenes',
      'patients',
      'incidents',
      'vehicles',
      'dispatches',
      'responders',
      'responses',
      'times',
      'situations',
      'dispositions',
      'histories',
      'narratives',
      'medications',
      'vitals',
      'procedures',
      'files',
      'forms',
      'signatures',
      'reports',
    ]);
    testSession = session(app);
  });

  context('Agency without a PSAP', () => {
    beforeEach(async () => {
      await testSession
        .post('/login')
        .set('Host', `bayshoreambulance.${process.env.BASE_HOST}`)
        .send({ email: 'bayshore@peakresponse.net', password: 'abcd1234' })
        .expect(HttpStatus.OK);
    });

    describe('POST /', () => {
      it('creates a new Report, generating a new Incident number', async () => {
        // first data payload- no incident number, server generates
        let data = {
          Scene: {
            id: 'dc3b005e-020d-4cbc-a09c-b7358387902b',
            canonicalId: 'eef175e1-d201-4c07-aab4-18878234802d',
            address1: '1 Dr Carlton B Goodlett Pl',
            cityId: '2411786',
            countyId: '06075',
            stateId: '06',
            zip: '94102',
          },
          Incident: {
            id: '89839619-4bbc-43fb-b2dc-9c97396c5714',
            sceneId: 'eef175e1-d201-4c07-aab4-18878234802d',
          },
          Report: {
            id: 'bb0d32dd-e391-45bf-9df7-0f7c0467fefd',
            canonicalId: 'bb80829d-5f11-491b-bf87-8f576841d65d',
            incidentId: '89839619-4bbc-43fb-b2dc-9c97396c5714',
            sceneId: 'dc3b005e-020d-4cbc-a09c-b7358387902b',
            data: {
              'eRecord.01': {
                _text: 'bb80829d-5f11-491b-bf87-8f576841d65d',
              },
              'eRecord.SoftwareApplicationGroup': {
                'eRecord.02': {
                  _text: 'Peak Response Inc',
                },
                'eRecord.03': {
                  _text: 'Peak Response',
                },
                'eRecord.04': {
                  _text: 'Integration test version 1',
                },
              },
            },
          },
        };
        const response = await testSession
          .post(`/api/reports`)
          .set('Host', `bayshoreambulance.${process.env.BASE_HOST}`)
          .send(data)
          .expect(HttpStatus.CREATED);
        assert.deepStrictEqual(response.body.Incident?.[0]?.reportsCount, 1);

        let report = await models.Report.findByPk('bb0d32dd-e391-45bf-9df7-0f7c0467fefd');
        assert(report);
        assert.deepStrictEqual(report.data, data.Report.data);
        assert.deepStrictEqual(report.updatedAttributes, ['id', 'canonicalId', 'incidentId', 'data', 'sceneId']);
        assert.deepStrictEqual(report.updatedDataAttributes, ['/eRecord.01', '/eRecord.SoftwareApplicationGroup']);

        let incident = await report.getIncident();
        assert(incident);
        assert.deepStrictEqual(incident.sceneId, data.Incident.sceneId);
        assert.deepStrictEqual(incident.psapId, null);
        assert.deepStrictEqual(incident.number, '1');

        // second payload, no incident number, server generates increment
        data = {
          Scene: {
            id: '65b2ef4e-f6db-49c5-90da-9bcfed7bd9cd',
            canonicalId: '6179a265-3011-4c78-ba42-6e38dbbee2d1',
            address1: '1 Dr Carlton B Goodlett Pl',
            cityId: '2411786',
            countyId: '06075',
            stateId: '06',
            zip: '94102',
          },
          Incident: {
            id: '1f835b04-b88e-4276-8bcf-b92858511e68',
            sceneId: '6179a265-3011-4c78-ba42-6e38dbbee2d1',
          },
          Report: {
            id: 'bf0009a4-e3b4-419d-a303-3d698c088769',
            canonicalId: '5c56842a-1e5f-487c-9bac-4d1c7422d49f',
            incidentId: '1f835b04-b88e-4276-8bcf-b92858511e68',
            sceneId: '65b2ef4e-f6db-49c5-90da-9bcfed7bd9cd',
            data: {
              'eRecord.01': {
                _text: '5c56842a-1e5f-487c-9bac-4d1c7422d49f',
              },
              'eRecord.SoftwareApplicationGroup': {
                'eRecord.02': {
                  _text: 'Peak Response Inc',
                },
                'eRecord.03': {
                  _text: 'Peak Response',
                },
                'eRecord.04': {
                  _text: 'Integration test version 1',
                },
              },
            },
          },
        };
        await testSession
          .post(`/api/reports`)
          .set('Host', `bayshoreambulance.${process.env.BASE_HOST}`)
          .send(data)
          .expect(HttpStatus.CREATED);

        report = await models.Report.findByPk('bf0009a4-e3b4-419d-a303-3d698c088769');
        assert(report);
        assert.deepStrictEqual(report.data, data.Report.data);
        assert.deepStrictEqual(report.updatedAttributes, ['id', 'canonicalId', 'incidentId', 'data', 'sceneId']);
        assert.deepStrictEqual(report.updatedDataAttributes, ['/eRecord.01', '/eRecord.SoftwareApplicationGroup']);

        incident = await report.getIncident();
        assert(incident);
        assert.deepStrictEqual(incident.sceneId, data.Incident.sceneId);
        assert.deepStrictEqual(incident.psapId, null);
        assert.deepStrictEqual(incident.number, '2');
        // third payload, duplicate incident number, server generates unique suffix
        data = {
          Scene: {
            id: '4cbe7e77-3834-49ca-aad3-db5fe499de20',
            canonicalId: 'f6a7bc9c-af1f-4727-b8e2-f4fe5762a030',
            address1: '1 Dr Carlton B Goodlett Pl',
            cityId: '2411786',
            countyId: '06075',
            stateId: '06',
            zip: '94102',
          },
          Incident: {
            id: '9eb208cf-09e2-4678-aa6c-baca0619a1b1',
            sceneId: 'f6a7bc9c-af1f-4727-b8e2-f4fe5762a030',
            number: '2',
          },
          Report: {
            id: 'e092a222-3ba6-4b45-bef1-b29b01542f48',
            canonicalId: '23028a08-537e-4b58-b7ce-4978fc63ce71',
            incidentId: '9eb208cf-09e2-4678-aa6c-baca0619a1b1',
            sceneId: '4cbe7e77-3834-49ca-aad3-db5fe499de20',
            data: {
              'eRecord.01': {
                _text: '23028a08-537e-4b58-b7ce-4978fc63ce71',
              },
              'eRecord.SoftwareApplicationGroup': {
                'eRecord.02': {
                  _text: 'Peak Response Inc',
                },
                'eRecord.03': {
                  _text: 'Peak Response',
                },
                'eRecord.04': {
                  _text: 'Integration test version 1',
                },
              },
            },
          },
        };
        await testSession
          .post(`/api/reports`)
          .set('Host', `bayshoreambulance.${process.env.BASE_HOST}`)
          .send(data)
          .expect(HttpStatus.CREATED);

        report = await models.Report.findByPk('e092a222-3ba6-4b45-bef1-b29b01542f48');
        assert(report);
        assert.deepStrictEqual(report.data, data.Report.data);
        assert.deepStrictEqual(report.updatedAttributes, ['id', 'canonicalId', 'incidentId', 'data', 'sceneId']);
        assert.deepStrictEqual(report.updatedDataAttributes, ['/eRecord.01', '/eRecord.SoftwareApplicationGroup']);

        incident = await report.getIncident();
        assert(incident);
        assert.deepStrictEqual(incident.sceneId, data.Incident.sceneId);
        assert.deepStrictEqual(incident.psapId, null);
        assert.deepStrictEqual(incident.number, '2-001');
      });
    });
  });

  context('Agency with PSAP', () => {
    beforeEach(async () => {
      await testSession
        .post('/login')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
        .expect(HttpStatus.OK);
    });

    describe('GET /', () => {
      it('returns Reports for an Incident', async () => {
        const response = await testSession
          .get(`/api/reports?incidentId=6621202f-ca09-4ad9-be8f-b56346d1de65`)
          .set('Host', `bmacc.${process.env.BASE_HOST}`)
          .expect(HttpStatus.OK);
        const data = response.body;
        assert(data.Report);
        assert.deepStrictEqual(data.Report.length, 2);
        assert.deepStrictEqual(data.Report[0].filterPriority, models.Patient.Priority.DECEASED);
        assert.deepStrictEqual(data.Report[1].filterPriority, models.Patient.Priority.TRANSPORTED);

        assert.deepStrictEqual(data.Disposition.length, 2);
        assert.deepStrictEqual(data.Facility.length, 1);
        assert.deepStrictEqual(data.File.length, 2);
        assert.deepStrictEqual(data.Form.length, 1);
        assert.deepStrictEqual(data.History.length, 2);
        assert.deepStrictEqual(data.Narrative.length, 2);
        assert.deepStrictEqual(data.Medication.length, 2);
        assert.deepStrictEqual(data.Patient?.length, 2);
        assert.deepStrictEqual(data.Procedure.length, 2);
        assert.deepStrictEqual(data.Response?.length, 2);
        assert.deepStrictEqual(data.Scene?.length, 1);
        assert.deepStrictEqual(data.Signature?.length, 1);
        assert.deepStrictEqual(data.Situation?.length, 2);
        assert.deepStrictEqual(data.Time.length, 2);
        assert.deepStrictEqual(data.Vital.length, 2);
      });
    });

    describe('POST /', () => {
      it('creates a new Report, generating a new interleaved Incident number', async () => {
        const data = {
          Scene: {
            id: 'dc3b005e-020d-4cbc-a09c-b7358387902b',
            canonicalId: 'eef175e1-d201-4c07-aab4-18878234802d',
            address1: '1 Dr Carlton B Goodlett Pl',
            cityId: '2411786',
            countyId: '06075',
            stateId: '06',
            zip: '94102',
          },
          Incident: {
            id: '89839619-4bbc-43fb-b2dc-9c97396c5714',
            sceneId: 'eef175e1-d201-4c07-aab4-18878234802d',
          },
          Report: {
            id: 'bb0d32dd-e391-45bf-9df7-0f7c0467fefd',
            canonicalId: 'bb80829d-5f11-491b-bf87-8f576841d65d',
            incidentId: '89839619-4bbc-43fb-b2dc-9c97396c5714',
            sceneId: 'dc3b005e-020d-4cbc-a09c-b7358387902b',
            data: {
              'eRecord.01': {
                _text: 'bb80829d-5f11-491b-bf87-8f576841d65d',
              },
              'eRecord.SoftwareApplicationGroup': {
                'eRecord.02': {
                  _text: 'Peak Response Inc',
                },
                'eRecord.03': {
                  _text: 'Peak Response',
                },
                'eRecord.04': {
                  _text: 'Integration test version 1',
                },
              },
            },
          },
        };
        await testSession.post(`/api/reports`).set('Host', `bmacc.${process.env.BASE_HOST}`).send(data).expect(HttpStatus.CREATED);

        const report = await models.Report.findByPk('bb0d32dd-e391-45bf-9df7-0f7c0467fefd');
        assert(report);
        assert.deepStrictEqual(report.data, data.Report.data);
        assert.deepStrictEqual(report.updatedAttributes, ['id', 'canonicalId', 'incidentId', 'data', 'sceneId']);
        assert.deepStrictEqual(report.updatedDataAttributes, ['/eRecord.01', '/eRecord.SoftwareApplicationGroup']);

        const incident = await report.getIncident();
        assert(incident);
        assert.deepStrictEqual(incident.sceneId, data.Incident.sceneId);
        assert.deepStrictEqual(incident.psapId, '588');
        assert.deepStrictEqual(incident.number, '12345679-001');
      });

      it('creates a new Report, resolving duplicate Incident numbers', async () => {
        const data = {
          Scene: {
            id: 'dc3b005e-020d-4cbc-a09c-b7358387902b',
            canonicalId: 'eef175e1-d201-4c07-aab4-18878234802d',
            address1: '1 Dr Carlton B Goodlett Pl',
            cityId: '2411786',
            countyId: '06075',
            stateId: '06',
            zip: '94102',
          },
          Incident: {
            id: '89839619-4bbc-43fb-b2dc-9c97396c5714',
            sceneId: 'eef175e1-d201-4c07-aab4-18878234802d',
            number: '12345678',
          },
          Report: {
            id: 'bb0d32dd-e391-45bf-9df7-0f7c0467fefd',
            canonicalId: 'bb80829d-5f11-491b-bf87-8f576841d65d',
            incidentId: '89839619-4bbc-43fb-b2dc-9c97396c5714',
            sceneId: 'dc3b005e-020d-4cbc-a09c-b7358387902b',
            data: {
              'eRecord.01': {
                _text: 'bb80829d-5f11-491b-bf87-8f576841d65d',
              },
              'eRecord.SoftwareApplicationGroup': {
                'eRecord.02': {
                  _text: 'Peak Response Inc',
                },
                'eRecord.03': {
                  _text: 'Peak Response',
                },
                'eRecord.04': {
                  _text: 'Integration test version 1',
                },
              },
            },
          },
        };
        await testSession.post(`/api/reports`).set('Host', `bmacc.${process.env.BASE_HOST}`).send(data).expect(HttpStatus.CREATED);

        const report = await models.Report.findByPk('bb0d32dd-e391-45bf-9df7-0f7c0467fefd');
        assert(report);
        assert.deepStrictEqual(report.data, data.Report.data);
        assert.deepStrictEqual(report.updatedAttributes, ['id', 'canonicalId', 'incidentId', 'data', 'sceneId']);
        assert.deepStrictEqual(report.updatedDataAttributes, ['/eRecord.01', '/eRecord.SoftwareApplicationGroup']);

        const incident = await report.getIncident();
        assert(incident);
        assert.deepStrictEqual(incident.sceneId, data.Incident.sceneId);
        assert.deepStrictEqual(incident.psapId, '588');
        assert.deepStrictEqual(incident.number, '12345678-001');
      });

      it('creates a new Report, including new Incident/Scene records', async () => {
        const data = {
          Scene: {
            id: 'dc3b005e-020d-4cbc-a09c-b7358387902b',
            canonicalId: 'eef175e1-d201-4c07-aab4-18878234802d',
            address1: '1 Dr Carlton B Goodlett Pl',
            cityId: '2411786',
            countyId: '06075',
            stateId: '06',
            zip: '94102',
          },
          Incident: {
            id: '89839619-4bbc-43fb-b2dc-9c97396c5714',
            sceneId: 'eef175e1-d201-4c07-aab4-18878234802d',
            number: '12345680',
          },
          Narrative: {
            id: '013d839b-28c7-4159-8d4c-49956c0cde0a',
            canonicalId: '468b2a26-aa11-4d3b-8c5d-9e4542560e37',
            data: {
              'eNarrative.01': {
                _text: 'This is the narrative text.',
              },
            },
          },
          Patient: {
            id: '776d3386-96c3-4eec-a3b1-a6742611b45c',
            canonicalId: 'd2bdf4e6-0816-42b0-906e-820dca7f7a12',
            firstName: 'Test',
            lastName: 'Patient',
          },
          Report: {
            id: 'bb0d32dd-e391-45bf-9df7-0f7c0467fefd',
            canonicalId: 'bb80829d-5f11-491b-bf87-8f576841d65d',
            incidentId: '89839619-4bbc-43fb-b2dc-9c97396c5714',
            sceneId: 'dc3b005e-020d-4cbc-a09c-b7358387902b',
            narrativeId: '013d839b-28c7-4159-8d4c-49956c0cde0a',
            patientId: '776d3386-96c3-4eec-a3b1-a6742611b45c',
            data: {
              'eRecord.01': {
                _text: 'bb80829d-5f11-491b-bf87-8f576841d65d',
              },
              'eRecord.SoftwareApplicationGroup': {
                'eRecord.02': {
                  _text: 'Peak Response Inc',
                },
                'eRecord.03': {
                  _text: 'Peak Response',
                },
                'eRecord.04': {
                  _text: 'Integration test version 1',
                },
              },
            },
          },
        };
        await testSession.post(`/api/reports`).set('Host', `bmacc.${process.env.BASE_HOST}`).send(data).expect(HttpStatus.CREATED);

        const report = await models.Report.findByPk('bb0d32dd-e391-45bf-9df7-0f7c0467fefd');
        assert(report);
        assert.deepStrictEqual(report.data, data.Report.data);
        assert.deepStrictEqual(report.updatedAttributes, [
          'id',
          'canonicalId',
          'incidentId',
          'data',
          'sceneId',
          'patientId',
          'narrativeId',
        ]);
        assert.deepStrictEqual(report.updatedDataAttributes, ['/eRecord.01', '/eRecord.SoftwareApplicationGroup']);

        const incident = await report.getIncident();
        assert(incident);
        assert.deepStrictEqual(incident.sceneId, data.Incident.sceneId);
        assert.deepStrictEqual(incident.number, data.Incident.number);
        assert.deepStrictEqual(incident.psapId, '588');

        const scene = await report.getScene();
        assert(scene);
        assert.deepStrictEqual(scene.address1, data.Scene.address1);
        assert.deepStrictEqual(scene.cityId, data.Scene.cityId);
        assert.deepStrictEqual(scene.countyId, data.Scene.countyId);
        assert.deepStrictEqual(scene.stateId, data.Scene.stateId);
        assert.deepStrictEqual(scene.zip, data.Scene.zip);

        const narrative = await report.getNarrative();
        assert(narrative);
        assert.deepStrictEqual(narrative.id, data.Narrative.id);
        assert.deepStrictEqual(narrative.data, data.Narrative.data);

        const patient = await report.getPatient();
        assert(patient);
        assert.deepStrictEqual(patient.id, data.Patient.id);
        assert.deepStrictEqual(patient.firstName, data.Patient.firstName);
        assert.deepStrictEqual(patient.lastName, data.Patient.lastName);

        const canonical = await report.getCanonical();
        assert(canonical);
        assert.deepStrictEqual(canonical.data, report.data);
        assert.deepStrictEqual(canonical.narrativeId, report.narrativeId);
      });

      it('creates a new Report for an existing Incident/Scene', async () => {
        const data = {
          Narrative: {
            id: '89529548-19f7-4a17-b7d3-ad783c575f63',
            canonicalId: '1460a121-c817-4d8d-8d79-c1daec66946d',
            data: {
              'eNarrative.01': {
                _text: 'This is the narrative text.',
              },
            },
          },
          Patient: {
            id: '059efacd-ebf3-486a-b726-9a49912187f9',
            canonicalId: 'ded89a78-359c-487e-99ce-c6d292c9b0de',
            firstName: 'Test',
            lastName: 'Patient',
          },
          Report: {
            id: '2f1b5eb1-4689-41ef-8d88-aeda834a99ac',
            canonicalId: '90cf28b8-a59f-4ca2-8a4b-7756e1c0bd9e',
            sceneId: 'c7e97d09-dc4b-4b4e-963c-b0ba066934c1',
            narrativeId: '89529548-19f7-4a17-b7d3-ad783c575f63',
            patientId: '059efacd-ebf3-486a-b726-9a49912187f9',
            incidentId: '6621202f-ca09-4ad9-be8f-b56346d1de65',
            data: {
              'eRecord.01': {
                _text: '90cf28b8-a59f-4ca2-8a4b-7756e1c0bd9e',
              },
              'eRecord.SoftwareApplicationGroup': {
                'eRecord.02': {
                  _text: 'Peak Response Inc',
                },
                'eRecord.03': {
                  _text: 'Peak Response',
                },
                'eRecord.04': {
                  _text: 'Integration test version 1',
                },
              },
            },
          },
        };
        await testSession.post(`/api/reports`).set('Host', `bmacc.${process.env.BASE_HOST}`).send(data).expect(HttpStatus.CREATED);

        const report = await models.Report.findByPk('2f1b5eb1-4689-41ef-8d88-aeda834a99ac');
        assert(report);
        assert.deepStrictEqual(report.data, data.Report.data);
        assert.deepStrictEqual(report.updatedAttributes, [
          'id',
          'canonicalId',
          'incidentId',
          'data',
          'sceneId',
          'patientId',
          'narrativeId',
        ]);
        assert.deepStrictEqual(report.updatedDataAttributes, ['/eRecord.01', '/eRecord.SoftwareApplicationGroup']);

        const narrative = await report.getNarrative();
        assert(narrative);
        assert.deepStrictEqual(narrative.id, data.Narrative.id);
        assert.deepStrictEqual(narrative.data, data.Narrative.data);

        const patient = await report.getPatient();
        assert(patient);
        assert.deepStrictEqual(patient.id, data.Patient.id);
        assert.deepStrictEqual(patient.firstName, data.Patient.firstName);
        assert.deepStrictEqual(patient.lastName, data.Patient.lastName);

        const canonical = await report.getCanonical();
        assert(canonical);
        assert.deepStrictEqual(canonical.data, report.data);
        assert.deepStrictEqual(canonical.narrativeId, report.narrativeId);
      });

      it('updates an existing Report', async () => {
        const data = {
          Narrative: {
            id: '3082e66f-7ed8-4488-857b-b49364356ab1',
            parentId: 'c5fa9054-c293-4a3f-a8c4-e11eef6a7e8f',
            data: {
              'eNarrative.01': {
                _text: 'This is the updated narrative text.',
              },
            },
          },
          Report: {
            id: 'da67b07b-144b-42c3-85f4-b3ce1bc8d235',
            parentId: 'c19bb731-5e9e-4feb-9192-720782ecf9a8',
            narrativeId: '3082e66f-7ed8-4488-857b-b49364356ab1',
            data_patch: [
              {
                op: 'replace',
                path: '/eRecord.SoftwareApplicationGroup/eRecord.04/_text',
                value: 'Integration test version 2',
              },
            ],
          },
        };
        await testSession.post(`/api/reports`).set('Host', `bmacc.${process.env.BASE_HOST}`).send(data).expect(HttpStatus.OK);

        const report = await models.Report.findByPk('da67b07b-144b-42c3-85f4-b3ce1bc8d235');
        assert(report);
        assert.deepStrictEqual(report.data, {
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
              _text: 'Integration test version 2',
            },
          },
        });
        assert.deepStrictEqual(report.updatedAttributes, ['id', 'parentId', 'narrativeId', 'data']);
        assert.deepStrictEqual(report.updatedDataAttributes, ['/eRecord.SoftwareApplicationGroup/eRecord.04']);

        const narrative = await report.getNarrative();
        assert(narrative);
        assert.deepStrictEqual(narrative.id, data.Narrative.id);
        assert.deepStrictEqual(narrative.data, data.Narrative.data);
        assert.deepStrictEqual(narrative.updatedAttributes, ['id', 'parentId', 'data']);
        assert.deepStrictEqual(narrative.updatedDataAttributes, ['/eNarrative.01']);

        const canonical = await report.getCanonical();
        assert(canonical);
        assert.deepStrictEqual(canonical.data, report.data);
        assert.deepStrictEqual(canonical.narrativeId, report.narrativeId);

        const versions = await canonical.getVersions();
        assert.deepStrictEqual(versions.length, 2);
      });
    });

    describe('GET /:id', () => {
      it('returns the specified Report record', async () => {
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

        const response = await testSession
          .get(`/api/reports/4a7b8b77-b7c2-4338-8508-eeb98fb8d3ed`)
          .set('Host', `bmacc.${process.env.BASE_HOST}`)
          .expect(HttpStatus.OK);
        const payload = response.body;
        assert.deepStrictEqual(
          payload,
          JSON.parse(
            JSON.stringify({
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
            })
          )
        );
      });
    });

    describe('GET /:id/preview', () => {
      it('returns the NEMSIS XML EMSDataSet export of the Report', async () => {
        const response = await testSession
          .get(`/api/reports/4a7b8b77-b7c2-4338-8508-eeb98fb8d3ed/preview`)
          .set('Host', `bmacc.${process.env.BASE_HOST}`)
          .expect(HttpStatus.OK);
        assert.deepStrictEqual(response.headers['content-type'], 'application/xml; charset=utf-8');
        assert.deepStrictEqual(
          response.text,
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
			<eOther>
				<eOther.FileGroup>
					<eOther.09>4509001</eOther.09>
					<eOther.10>mp4</eOther.10>
				</eOther.FileGroup>
				<eOther.SignatureGroup>
					<eOther.12>4512015</eOther.12>
					<eOther.13>4513009</eOther.13>
					<eOther.15>4515019</eOther.15>
				</eOther.SignatureGroup>
			</eOther>
		</PatientCareReport>
	</Header>
</EMSDataSet>`
        );
      });
    });
  });
});
