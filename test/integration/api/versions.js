const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');

describe('/api/versions', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'users',
      'states',
      'counties',
      'cities',
      'psaps',
      'dispatchers',
      'nemsisStateDataSets',
      'nemsisSchematrons',
      'regions',
      'agencies',
      'versions',
      'employments',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(StatusCodes.OK);
  });

  describe('GET /', () => {
    it('returns a list of Versions for the Agency', async () => {
      const response = await testSession.get('/api/versions').set('Host', `bmacc.${process.env.BASE_HOST}`).expect(StatusCodes.OK);
      const versions = response.body;
      assert.deepStrictEqual(versions?.length, 2);
    });
  });

  describe('POST /', () => {
    it('returns a new draft Version for the Agency if needed', async () => {
      const oldDraft = await models.Version.findByPk('682d5860-c11e-4a40-bfcc-b2dadec9e7d4');
      await oldDraft.destroy();
      const response = await testSession.post('/api/versions').set('Host', `bmacc.${process.env.BASE_HOST}`).expect(StatusCodes.OK);

      assert(response.body?.id);
      const draft = await models.Version.findByPk(response.body.id);
      assert.deepStrictEqual(draft.isDraft, true);
    });

    it('returns the current draft Version for the Agency if it exists', async () => {
      const response = await testSession.post('/api/versions').set('Host', `bmacc.${process.env.BASE_HOST}`).expect(StatusCodes.OK);
      assert.deepStrictEqual(response.body?.id, '682d5860-c11e-4a40-bfcc-b2dadec9e7d4');
    });
  });

  describe('PATCH /:id/commit', () => {
    it('commits the specified draft Version for its Agency', async () => {
      await testSession
        .patch('/api/versions/682d5860-c11e-4a40-bfcc-b2dadec9e7d4/commit')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(StatusCodes.OK);
      const version = await models.Version.findByPk('682d5860-c11e-4a40-bfcc-b2dadec9e7d4');
      assert.deepStrictEqual(version.isDraft, false);
      const agency = await version.getAgency();
      assert.deepStrictEqual(agency.versionId, version.id);
    });
  });

  describe('GET /:id', () => {
    it('returns the specified Version for the Agency', async () => {
      const response = await testSession
        .get('/api/versions/c680282e-8756-4b02-82f3-2437c22ecade')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(StatusCodes.OK);
      assert.deepStrictEqual(response.body, {
        id: 'c680282e-8756-4b02-82f3-2437c22ecade',
        name: '2020-04-06-c680282e87564b0282f32437c22ecade',
        agencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
        isDraft: false,
        nemsisVersion: '3.5.0.211008CP3',
        stateDataSetId: '45b8b4d4-0fad-438a-b1b8-fa1425c6a5ae',
        demSchematronIds: [],
        emsSchematronIds: ['dabc90e5-b8fa-4dac-bcfd-be659ba46b54'],
        demCustomConfiguration: [],
        isValid: false,
        validationErrors: null,
        createdAt: '2020-04-06T21:22:10.158Z',
        createdById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
        updatedAt: response.body.updatedAt,
        updatedById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
      });
    });
  });

  describe('DELETE /:id', () => {
    it('deletes the specified Version', async () => {
      await testSession
        .delete('/api/versions/682d5860-c11e-4a40-bfcc-b2dadec9e7d4')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(StatusCodes.OK);
      const record = await models.Version.findByPk('682d5860-c11e-4a40-bfcc-b2dadec9e7d4');
      assert.deepStrictEqual(record, null);
    });
  });
});
