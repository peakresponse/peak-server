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
        'agencies',
        'users',
        'contacts',
        'employments',
        'psaps',
        'dispatchers',
        'scenes',
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
        const report = (
          await scene.incident.getReports({
            include: [
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
          })
        )[0];
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
            assert.deepStrictEqual(actual.Report, JSON.parse(JSON.stringify([report.toJSON()])));
            assert.deepStrictEqual(actual.Response, JSON.parse(JSON.stringify([report.response.toJSON()])));
            assert.deepStrictEqual(actual.Time, JSON.parse(JSON.stringify([report.time.toJSON()])));
            assert.deepStrictEqual(actual.Situation, JSON.parse(JSON.stringify([report.situation.toJSON()])));
            assert.deepStrictEqual(actual.History, JSON.parse(JSON.stringify([report.history.toJSON()])));
            assert.deepStrictEqual(actual.Disposition, JSON.parse(JSON.stringify([report.disposition.toJSON()])));
            assert.deepStrictEqual(actual.Narrative, JSON.parse(JSON.stringify([report.narrative.toJSON()])));
            assert.deepStrictEqual(actual.Medication, JSON.parse(JSON.stringify(report.medications.map((m) => m.toJSON()))));
            assert.deepStrictEqual(actual.Vital, JSON.parse(JSON.stringify(report.vitals.map((m) => m.toJSON()))));
            assert.deepStrictEqual(actual.Procedure, JSON.parse(JSON.stringify(report.procedures.map((m) => m.toJSON()))));
            assert.deepStrictEqual(actual.File, JSON.parse(JSON.stringify(report.files.map((m) => m.toJSON()))));
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
          .exec(async () => {
            await wss.dispatchIncidentUpdate('6621202f-ca09-4ad9-be8f-b56346d1de65');
          })
          .expectJson((actual) => {
            assert.deepStrictEqual(actual.City, JSON.parse(JSON.stringify(incident.scene.city.toJSON())));
            assert.deepStrictEqual(actual.Dispatch, JSON.parse(JSON.stringify(incident.dispatches.map((d) => d.toJSON()))));
            assert.deepStrictEqual(actual.Incident, JSON.parse(JSON.stringify(incident.toJSON())));
            assert.deepStrictEqual(actual.Scene, JSON.parse(JSON.stringify(incident.scene.toJSON())));
            assert.deepStrictEqual(actual.State, JSON.parse(JSON.stringify(incident.scene.state.toJSON())));
            assert.deepStrictEqual(actual.Vehicle, JSON.parse(JSON.stringify(incident.dispatches.map((d) => d.vehicle.toJSON()))));
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
          .exec(async () => {
            await wss.dispatchSceneUpdate(incident.scene.id);
          })
          .expectJson((actual) => {
            assert.deepStrictEqual(actual.City, JSON.parse(JSON.stringify(incident.scene.city.toJSON())));
            assert.deepStrictEqual(actual.Dispatch, JSON.parse(JSON.stringify(incident.dispatches.map((d) => d.toJSON()))));
            assert.deepStrictEqual(actual.Incident, JSON.parse(JSON.stringify(incident.toJSON())));
            assert.deepStrictEqual(actual.Scene, JSON.parse(JSON.stringify(incident.scene.toJSON())));
            assert.deepStrictEqual(actual.State, JSON.parse(JSON.stringify(incident.scene.state.toJSON())));
            assert.deepStrictEqual(actual.Vehicle, JSON.parse(JSON.stringify(incident.dispatches.map((d) => d.vehicle.toJSON()))));
          })
          .close()
          .expectClosed();
      });
    });
  });
});
