const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');

const app = require('../../../app');
const models = require('../../../models');

describe('/api/guides', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures(['states', 'counties', 'cities', 'users', 'guides', 'guideSections']);
    testSession = session(app);
  });

  context('unauthenticated', () => {
    describe('GET /', () => {
      it('returns all visible Guides', async () => {
        const response = await testSession.get('/api/guides').expect(StatusCodes.OK);
        const data = response.body;
        assert(data);
        assert.deepStrictEqual(data.length, 3);
        assert.deepStrictEqual(data[0].name, 'Getting Started');
        assert.deepStrictEqual(data[1].name, 'Run Reporting');
        assert.deepStrictEqual(data[2].name, 'Mass Casualty Incidents');
      });

      it('ignores the showAll query param', async () => {
        const response = await testSession.get('/api/guides?showAll=true').expect(StatusCodes.OK);
        const data = response.body;
        assert(data);
        assert.deepStrictEqual(data.length, 3);
      });
    });

    describe('GET /:id', () => {
      it('returns a visible Guide', async () => {
        const response = await testSession.get('/api/guides/739bf09f-5670-45c9-9149-9d15710f03e7').expect(StatusCodes.OK);
        const data = response.body;
        assert(data);
        assert.deepStrictEqual(data.name, 'Getting Started');
      });

      it('return a visible Guide by slug', async () => {
        const response = await testSession.get('/api/guides/getting-started').expect(StatusCodes.OK);
        const data = response.body;
        assert(data);
        assert.deepStrictEqual(data.name, 'Getting Started');
        assert.deepStrictEqual(data.sections.length, 4);
        assert.deepStrictEqual(data.sections[0].name, 'Signing In');
        assert.deepStrictEqual(data.sections[1].name, 'Selecting your Unit/Vehicle');
        assert.deepStrictEqual(data.sections[2].name, 'Changing your Unit/Vehicle');
        assert.deepStrictEqual(data.sections[3].name, 'Logging Out');
      });

      it('returns forbidden for an invisible Guide', async () => {
        await testSession.get('/api/guides/14b0bd28-8d22-49bc-bd38-f630e432cea1').expect(StatusCodes.FORBIDDEN);
      });
    });
  });

  context('authenticated', () => {
    beforeEach(async () => {
      await testSession.post('/login').send({ email: 'admin@peakresponse.net', password: 'abcd1234' }).expect(StatusCodes.OK);
    });

    describe('GET /', () => {
      it('returns all visible Guides', async () => {
        const response = await testSession.get('/api/guides').expect(StatusCodes.OK);
        const data = response.body;
        assert(data);
        assert.deepStrictEqual(data.length, 3);
        assert.deepStrictEqual(data[0].name, 'Getting Started');
        assert.deepStrictEqual(data[1].name, 'Run Reporting');
        assert.deepStrictEqual(data[2].name, 'Mass Casualty Incidents');
      });

      it('includes hidden Guides with the showAll query param', async () => {
        const response = await testSession.get('/api/guides?showAll=true').expect(StatusCodes.OK);
        const data = response.body;
        assert(data);
        assert.deepStrictEqual(data.length, 4);
      });
    });

    describe('POST /', () => {
      it('creates a new Guide record', async () => {
        const response = await testSession
          .post('/api/guides')
          .send({
            name: 'New Title',
            navName: 'New',
            slug: 'new-title',
            body: 'This is body text',
            position: 5,
            isVisible: false,
          })
          .expect(StatusCodes.CREATED);
        assert(response.body.id);
        const record = await models.Guide.findByPk(response.body.id);
        assert.deepStrictEqual(record.name, 'New Title');
        assert.deepStrictEqual(record.navName, 'New');
        assert.deepStrictEqual(record.slug, 'new-title');
        assert.deepStrictEqual(record.body, 'This is body text');
        assert.deepStrictEqual(record.position, 5);
        assert.deepStrictEqual(record.isVisible, false);
        assert.deepStrictEqual(record.createdById, '7f666fe4-dbdd-4c7f-ab44-d9157379a680');
        assert.deepStrictEqual(record.updatedById, '7f666fe4-dbdd-4c7f-ab44-d9157379a680');
      });
    });

    describe('PATCH /:id', () => {
      it('updates an existing Guide record', async () => {
        const response = await testSession
          .patch('/api/guides/14b0bd28-8d22-49bc-bd38-f630e432cea1')
          .send({
            name: 'Visible Draft',
            navName: 'Visible',
            slug: 'visible-draft',
            body: 'With body',
            position: 10,
            isVisible: true,
          })
          .expect(StatusCodes.OK);
        assert.deepStrictEqual(response.body.id, '14b0bd28-8d22-49bc-bd38-f630e432cea1');
        assert.deepStrictEqual(response.body.name, 'Visible Draft');
        assert.deepStrictEqual(response.body.navName, 'Visible');
        assert.deepStrictEqual(response.body.slug, 'visible-draft');
        assert.deepStrictEqual(response.body.body, 'With body');
        assert.deepStrictEqual(response.body.position, 10);
        assert.deepStrictEqual(response.body.isVisible, true);

        const record = await models.Guide.findByPk('14b0bd28-8d22-49bc-bd38-f630e432cea1');
        assert.deepStrictEqual(record.name, 'Visible Draft');
        assert.deepStrictEqual(record.navName, 'Visible');
        assert.deepStrictEqual(record.body, 'With body');
        assert.deepStrictEqual(record.slug, 'visible-draft');
        assert.deepStrictEqual(record.position, 10);
        assert.deepStrictEqual(record.isVisible, true);
      });
    });

    describe('DELETE /:id', () => {
      it('deletes an existing Guide record', async () => {
        await testSession.delete('/api/guides/14b0bd28-8d22-49bc-bd38-f630e432cea1').expect(StatusCodes.OK);
        const record = await models.Export.findByPk('14b0bd28-8d22-49bc-bd38-f630e432cea1');
        assert.deepStrictEqual(record, null);
      });
    });
  });
});
