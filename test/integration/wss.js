const assert = require('assert');
const http = require('http');
const HttpStatus = require('http-status-codes');
const request = require('superwstest');
const session = require('supertest-session');

const helpers = require('../helpers');

const app = require('../../app');
const models = require('../../models');
const wss = require('../../wss');

const server = http.createServer(app);
wss.configure(server, app);

describe('wss', () => {
  let testSession;

  beforeEach((done) => {
    server.listen(0, 'localhost', done);
  });

  afterEach((done) => {
    server.close(done);
  });

  context('authenticated', () => {
    beforeEach(async () => {
      await helpers.loadFixtures([
        'cities',
        'counties',
        'states',
        'psaps',
        'agencies',
        'users',
        'facilities',
        'contacts',
        'employments',
        'dispatchers',
        'scenes',
        'patients',
        'incidents',
        'vehicles',
        'assignments',
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
        'reports',
      ]);
      // await request(server)
      testSession = session(server);
      await testSession
        .post('/login')
        .set('Host', process.env.BASE_HOST)
        .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
        .expect(HttpStatus.OK);
    });

    describe('/scene', () => {
      it('returns a complete Scene payload on connection', async () => {
        const scene = await models.Scene.findByPk('25db9094-03a5-4267-8314-bead229eff9d', {
          include: ['current', 'city', 'incident', 'state'],
        });
        const responders = await scene.getResponders({
          include: ['user', 'agency', 'vehicle'],
        });
        const reports = await scene.incident.getReports({
          include: [
            'scene',
            'patient',
            'response',
            'time',
            'situation',
            'history',
            'disposition',
            'narrative',
            'medications',
            'vitals',
            'procedures',
            'files',
          ],
          order: [['id', 'ASC']],
        });
        const payload = JSON.parse(JSON.stringify(await models.Report.createPayload(reports)));
        await request(server)
          .ws(`/scene?id=25db9094-03a5-4267-8314-bead229eff9d`)
          .set('Cookie', testSession.cookies.toValueString())
          .set('X-Agency-Subdomain', 'bmacc')
          .expectJson((actual) => {
            assert.deepStrictEqual(actual.Agency, JSON.parse(JSON.stringify(responders.map((r) => r.agency.toJSON()))));
            assert.deepStrictEqual(actual.Responder, JSON.parse(JSON.stringify(responders.map((r) => r.toJSON()))));
            assert.deepStrictEqual(
              actual.Vehicle,
              JSON.parse(
                JSON.stringify(
                  responders
                    .map((r) => r.vehicle)
                    .filter((v) => v)
                    .map((v) => v.toJSON())
                )
              )
            );
            assert.deepStrictEqual(actual.City, JSON.parse(JSON.stringify(scene.city.toJSON())));
            assert.deepStrictEqual(actual.Incident, JSON.parse(JSON.stringify(scene.incident.toJSON())));
            assert.deepStrictEqual(actual.Scene, JSON.parse(JSON.stringify(scene.toJSON())));
            assert.deepStrictEqual(actual.State, JSON.parse(JSON.stringify(scene.state.toJSON())));

            assert.deepStrictEqual(actual.Report, payload.Report);
            assert.deepStrictEqual(actual.Disposition, payload.Disposition);
            assert.deepStrictEqual(actual.History, payload.History);
            assert.deepStrictEqual(actual.Facility, payload.Facility);
            assert.deepStrictEqual(actual.File, payload.File);
            assert.deepStrictEqual(actual.Medication, payload.Medication);
            assert.deepStrictEqual(actual.Narrative, payload.Narrative);
            assert.deepStrictEqual(actual.Patient, payload.Patient);
            assert.deepStrictEqual(actual.Procedure, payload.Procedure);
            assert.deepStrictEqual(actual.Response, payload.Response);
            assert.deepStrictEqual(actual.Situation, payload.Situation);
            assert.deepStrictEqual(actual.Time, payload.Time);
            assert.deepStrictEqual(actual.Vital, payload.Vital);
          })
          .close()
          .expectClosed();
      });
    });

    describe('/incidents', () => {
      it('is notified of Incidents changes', async () => {
        const incident = await models.Incident.findByPk('6621202f-ca09-4ad9-be8f-b56346d1de65', {
          include: [
            { model: models.Scene, as: 'scene', include: ['city', 'state'] },
            {
              model: models.Dispatch,
              as: 'dispatches',
              include: 'vehicle',
            },
          ],
        });
        await request(server)
          .ws(`/incidents?assignmentId=e5b169aa-e0a6-441b-92d4-95c729ff1988`)
          .set('Cookie', testSession.cookies.toValueString())
          .set('X-Agency-Subdomain', 'bmacc')
          .expectJson((actual) => {
            assert.deepStrictEqual(actual, {
              Dispatch: [],
              Incident: [],
              Scene: [],
              City: [],
              State: [],
              Vehicle: [],
            });
          })
          .exec(async () => {
            await wss.dispatchIncidentUpdate('6621202f-ca09-4ad9-be8f-b56346d1de65');
          })
          .expectJson((actual) => {
            assert.deepStrictEqual(actual.City, JSON.parse(JSON.stringify([incident.scene.city.toJSON()])));
            assert.deepStrictEqual(
              actual.Dispatch.sort((a, b) => a.id.localeCompare(b.id)),
              JSON.parse(JSON.stringify(incident.dispatches.map((d) => d.toJSON()))).sort((a, b) => a.id.localeCompare(b.id))
            );
            assert.deepStrictEqual(actual.Incident, JSON.parse(JSON.stringify([incident.toJSON()])));
            assert.deepStrictEqual(actual.Scene, JSON.parse(JSON.stringify([incident.scene.toJSON()])));
            assert.deepStrictEqual(actual.State, JSON.parse(JSON.stringify([incident.scene.state.toJSON()])));
            assert.deepStrictEqual(
              actual.Vehicle.sort((a, b) => a.callSign.localeCompare(b.callSign)),
              JSON.parse(JSON.stringify(incident.dispatches.map((d) => d.vehicle.toJSON()))).sort((a, b) =>
                a.callSign.localeCompare(b.callSign)
              )
            );
          })
          .close()
          .expectClosed();
      });

      it('is notified when associated Scenes change', async () => {
        const incident = await models.Incident.findByPk('6621202f-ca09-4ad9-be8f-b56346d1de65', {
          include: [
            { model: models.Scene, as: 'scene', include: ['city', 'state'] },
            {
              model: models.Dispatch,
              as: 'dispatches',
              include: 'vehicle',
            },
          ],
        });
        await request(server)
          .ws(`/incidents?assignmentId=e5b169aa-e0a6-441b-92d4-95c729ff1988`)
          .set('Cookie', testSession.cookies.toValueString())
          .set('X-Agency-Subdomain', 'bmacc')
          .expectJson((actual) => {
            assert.deepStrictEqual(actual, {
              Dispatch: [],
              Incident: [],
              Scene: [],
              City: [],
              State: [],
              Vehicle: [],
            });
          })
          .exec(async () => {
            await wss.dispatchSceneUpdate(incident.scene.id);
          })
          .expectJson((actual) => {
            assert.deepStrictEqual(actual.City, JSON.parse(JSON.stringify([incident.scene.city.toJSON()])));
            assert.deepStrictEqual(
              actual.Dispatch.sort((a, b) => a.id.localeCompare(b.id)),
              JSON.parse(JSON.stringify(incident.dispatches.map((d) => d.toJSON()))).sort((a, b) => a.id.localeCompare(b.id))
            );
            assert.deepStrictEqual(actual.Incident, JSON.parse(JSON.stringify([incident.toJSON()])));
            assert.deepStrictEqual(actual.Scene, JSON.parse(JSON.stringify([incident.scene.toJSON()])));
            assert.deepStrictEqual(actual.State, JSON.parse(JSON.stringify([incident.scene.state.toJSON()])));
            assert.deepStrictEqual(
              actual.Vehicle.sort((a, b) => a.id.localeCompare(b.id)),
              JSON.parse(JSON.stringify(incident.dispatches.map((d) => d.vehicle.toJSON()))).sort((a, b) => a.id.localeCompare(b.id))
            );
          })
          .close()
          .expectClosed();
      });
    });

    describe('/scenes', () => {
      it('is notified when a Report is updated', async () => {
        await request(server)
          .ws(`/scene?id=25db9094-03a5-4267-8314-bead229eff9d`)
          .set('Cookie', testSession.cookies.toValueString())
          .set('X-Agency-Subdomain', 'bmacc')
          .expectJson((actual) => {
            assert.deepStrictEqual(actual.Report.length, 2);
          })
          .exec(async () => {
            await wss.dispatchReportUpdate('4a7b8b77-b7c2-4338-8508-eeb98fb8d3ed');
          })
          .expectJson((actual) => {
            assert.deepStrictEqual(actual.Report.length, 1);
          })
          .close()
          .expectClosed();
      });
    });
  });
});
