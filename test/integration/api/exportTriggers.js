const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');

const app = require('../../../app');
const models = require('../../../models');

describe('/api/exports/triggers', () => {
  let testSession;

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
      'exports',
      'exportTriggers',
    ]);
    testSession = session(app);
  });

  context('as an admin', () => {
    beforeEach(async () => {
      await testSession.post('/login').send({ email: 'admin@peakresponse.net', password: 'abcd1234' }).expect(HttpStatus.OK);
    });

    describe('GET /', () => {
      it('returns all ExportTriggers for the specified Export', async () => {
        const response = await testSession.get('/api/exports/triggers?exportId=1cea9191-f9c1-413c-9fb8-37de06d372cb').expect(HttpStatus.OK);
        assert.deepStrictEqual(response.body?.length, 2);
        assert.deepStrictEqual(response.body[0].agency?.name, 'Bay Medic Ambulance - Contra Costa');
        assert.deepStrictEqual(response.body[1].agency?.name, 'Bayshore Ambulance');
      });

      it('returns 400 Bad Request if no specified Export', async () => {
        await testSession.get('/api/exports/triggers').expect(HttpStatus.BAD_REQUEST);
      });
    });

    describe('POST /', () => {
      it('creates a new ExportTrigger for the specified Export and Agency', async () => {
        const response = await testSession
          .post('/api/exports/triggers')
          .send({
            exportId: 'c41296ca-143d-4774-9bc1-58538984562f',
            agencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
            type: 'SAVE',
            debounceTime: 10,
            isEnabled: false,
          })
          .expect(HttpStatus.CREATED);

        assert(response.body?.id);
        const record = await models.ExportTrigger.findByPk(response.body.id);
        assert.deepStrictEqual(record.exportId, 'c41296ca-143d-4774-9bc1-58538984562f');
        assert.deepStrictEqual(record.agencyId, '9eeb6591-12f8-4036-8af8-6b235153d444');
        assert.deepStrictEqual(record.type, 'SAVE');
        assert.deepStrictEqual(record.debounceTime, 10);
        assert.deepStrictEqual(record.isEnabled, false);
      });
    });

    describe('GET /:id', () => {
      it('returns the specified ExportTrigger', async () => {
        const response = await testSession.get('/api/exports/triggers/3843042f-a086-4c3f-8a2c-ed663e0fb234').expect(HttpStatus.OK);
        assert.deepStrictEqual(response.body, {
          id: '3843042f-a086-4c3f-8a2c-ed663e0fb234',
          exportId: '1cea9191-f9c1-413c-9fb8-37de06d372cb',
          agencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
          type: 'SAVE',
          debounceTime: 0,
          isEnabled: true,
          approvedById: null,
          approvedAt: null,
          username: null,
          organization: null,
          createdById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          updatedById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          createdAt: '2020-10-06T01:44:44.012Z',
          updatedAt: response.body.updatedAt,
        });
      });
    });

    describe('PATCH /:id', () => {
      it('updates the specified ExportTrigger', async () => {
        const response = await testSession
          .patch('/api/exports/triggers/3843042f-a086-4c3f-8a2c-ed663e0fb234')
          .send({
            debounceTime: 10,
            isEnabled: false,
          })
          .expect(HttpStatus.OK);
        assert.deepStrictEqual(response.body, {
          id: '3843042f-a086-4c3f-8a2c-ed663e0fb234',
          exportId: '1cea9191-f9c1-413c-9fb8-37de06d372cb',
          agencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
          type: 'SAVE',
          debounceTime: 10,
          isEnabled: false,
          approvedById: null,
          approvedAt: null,
          username: null,
          organization: null,
          createdById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          updatedById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          createdAt: '2020-10-06T01:44:44.012Z',
          updatedAt: response.body.updatedAt,
        });
        const record = await models.ExportTrigger.findByPk('3843042f-a086-4c3f-8a2c-ed663e0fb234');
        assert.deepStrictEqual(record.debounceTime, 10);
        assert.deepStrictEqual(record.isEnabled, false);
      });
    });
  });

  context('as a user', () => {
    beforeEach(async () => {
      await testSession.post('/login').send({ email: 'regular@peakresponse.net', password: 'abcd1234' }).expect(HttpStatus.OK);
    });

    describe('GET /', () => {
      it('returns all configured ExportTriggers for their Agency', async () => {
        const response = await testSession.get('/api/exports/triggers').set('Host', `bmacc.${process.env.BASE_HOST}`).expect(HttpStatus.OK);
        assert.deepStrictEqual(response.body?.length, 2);
        assert.deepStrictEqual(response.body[0].export?.name, 'Export Fixture 1 (not visible)');
        assert.deepStrictEqual(response.body[1].export?.name, 'Export Fixture 3 (not visible)');
      });
    });

    describe('POST /', () => {
      it('creates a new ExportTrigger for the specified Export', async () => {
        const response = await testSession
          .post('/api/exports/triggers')
          .set('Host', `bmacc.${process.env.BASE_HOST}`)
          .send({
            exportId: 'c41296ca-143d-4774-9bc1-58538984562f',
            type: 'SAVE',
            debounceTime: 10,
            isEnabled: false,
          })
          .expect(HttpStatus.CREATED);

        assert(response.body?.id);
        const record = await models.ExportTrigger.findByPk(response.body.id);
        assert.deepStrictEqual(record.exportId, 'c41296ca-143d-4774-9bc1-58538984562f');
        assert.deepStrictEqual(record.agencyId, '9eeb6591-12f8-4036-8af8-6b235153d444');
        assert.deepStrictEqual(record.type, 'SAVE');
        assert.deepStrictEqual(record.debounceTime, 10);
        assert.deepStrictEqual(record.isEnabled, false);
      });
    });

    describe('GET /:id', () => {
      it('returns the specified ExportTrigger', async () => {
        const response = await testSession
          .get('/api/exports/triggers/3843042f-a086-4c3f-8a2c-ed663e0fb234')
          .set('Host', `bmacc.${process.env.BASE_HOST}`)
          .expect(HttpStatus.OK);
        assert.deepStrictEqual(response.body, {
          id: '3843042f-a086-4c3f-8a2c-ed663e0fb234',
          exportId: '1cea9191-f9c1-413c-9fb8-37de06d372cb',
          agencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
          type: 'SAVE',
          debounceTime: 0,
          isEnabled: true,
          approvedById: null,
          approvedAt: null,
          username: null,
          organization: null,
          createdById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          updatedById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          createdAt: '2020-10-06T01:44:44.012Z',
          updatedAt: response.body.updatedAt,
        });
      });
    });

    describe('PATCH /:id', () => {
      it('updates the specified ExportTrigger', async () => {
        const response = await testSession
          .patch('/api/exports/triggers/3843042f-a086-4c3f-8a2c-ed663e0fb234')
          .set('Host', `bmacc.${process.env.BASE_HOST}`)
          .send({
            debounceTime: 10,
            isEnabled: false,
          })
          .expect(HttpStatus.OK);
        assert.deepStrictEqual(response.body, {
          id: '3843042f-a086-4c3f-8a2c-ed663e0fb234',
          exportId: '1cea9191-f9c1-413c-9fb8-37de06d372cb',
          agencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
          type: 'SAVE',
          debounceTime: 10,
          isEnabled: false,
          approvedById: null,
          approvedAt: null,
          username: null,
          organization: null,
          createdById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          updatedById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          createdAt: '2020-10-06T01:44:44.012Z',
          updatedAt: response.body.updatedAt,
        });
        const record = await models.ExportTrigger.findByPk('3843042f-a086-4c3f-8a2c-ed663e0fb234');
        assert.deepStrictEqual(record.debounceTime, 10);
        assert.deepStrictEqual(record.isEnabled, false);
      });
    });
  });
});