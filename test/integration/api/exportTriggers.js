const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');

const app = require('../../../app');
// const models = require('../../../models');

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
  });
});
