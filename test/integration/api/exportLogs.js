const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');

const app = require('../../../app');

describe('/api/exports/logs', () => {
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
      'regions',
      'agencies',
      'versions',
      'venues',
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
      'exports',
      'exportTriggers',
      'exportLogs',
    ]);
    testSession = session(app);
  });

  context('as an admin', () => {
    beforeEach(async () => {
      await testSession.post('/login').send({ email: 'admin@peakresponse.net', password: 'abcd1234' }).expect(StatusCodes.OK);
    });

    describe('GET /', () => {
      it('returns all ExportLogs', async () => {
        const response = await testSession.get('/api/exports/logs').expect(StatusCodes.OK);
        assert.deepStrictEqual(response.body?.length, 3);
        assert.deepStrictEqual(response.body[0].id, '71ffbaca-52eb-486d-9652-1dfb69fd8c1e');
        assert.deepStrictEqual(response.body[1].id, 'c4806bc4-396c-4b68-8b29-a5c7b029d8f9');
        assert.deepStrictEqual(response.body[2].id, 'ad0d9791-a03a-43ed-9dbc-3bf6a228daa4');
      });
    });

    describe('GET /:id', () => {
      it('returns the specified ExportLog', async () => {
        const response = await testSession.get('/api/exports/logs/c4806bc4-396c-4b68-8b29-a5c7b029d8f9').expect(StatusCodes.OK);
        assert.deepStrictEqual(response.body, {
          id: 'c4806bc4-396c-4b68-8b29-a5c7b029d8f9',
          exportId: 'd897bfb5-c286-400e-9fa8-582cfef7791c',
          exportTriggerId: 'ed8b1c03-a635-4239-aee7-9e6010445b47',
          reportId: '9832d547-c14f-46ce-bb44-dae05d80d4ed',
          params: {},
          result: {},
          isError: false,
          createdAt: '2020-10-06T01:45:44.012Z',
          updatedAt: response.body.updatedAt,
          export: response.body.export,
          exportTrigger: response.body.exportTrigger,
        });
      });
    });
  });

  context('as a user', () => {
    beforeEach(async () => {
      await testSession.post('/login').send({ email: 'regular@peakresponse.net', password: 'abcd1234' }).expect(StatusCodes.OK);
    });

    describe('GET /', () => {
      it('returns all configured ExportTriggers for their Agency', async () => {
        const response = await testSession.get('/api/exports/logs').set('Host', `bmacc.${process.env.BASE_HOST}`).expect(StatusCodes.OK);
        assert.deepStrictEqual(response.body?.length, 2);
      });
    });

    describe('GET /:id', () => {
      it('returns the specified ExportLog', async () => {
        const response = await testSession
          .get('/api/exports/logs/c4806bc4-396c-4b68-8b29-a5c7b029d8f9')
          .set('Host', `bmacc.${process.env.BASE_HOST}`)
          .expect(StatusCodes.OK);
        assert.deepStrictEqual(response.body, {
          id: 'c4806bc4-396c-4b68-8b29-a5c7b029d8f9',
          exportId: 'd897bfb5-c286-400e-9fa8-582cfef7791c',
          exportTriggerId: 'ed8b1c03-a635-4239-aee7-9e6010445b47',
          reportId: '9832d547-c14f-46ce-bb44-dae05d80d4ed',
          params: {},
          result: {},
          isError: false,
          createdAt: '2020-10-06T01:45:44.012Z',
          updatedAt: response.body.updatedAt,
          export: response.body.export,
          exportTrigger: response.body.exportTrigger,
        });
      });

      it('returns forbidden if not belonging to the agency', async () => {
        await testSession
          .get('/api/exports/logs/71ffbaca-52eb-486d-9652-1dfb69fd8c1e')
          .set('Host', `bmacc.${process.env.BASE_HOST}`)
          .expect(StatusCodes.FORBIDDEN);
      });
    });
  });
});
