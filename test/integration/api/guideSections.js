const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');

const app = require('../../../app');
const models = require('../../../models');

describe('/api/guides/sections', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures(['states', 'counties', 'cities', 'users', 'guides', 'guideSections']);
    testSession = session(app);
    await testSession.post('/login').send({ email: 'admin@peakresponse.net', password: 'abcd1234' }).expect(StatusCodes.OK);
  });

  describe('GET /', () => {
    it('returns all GuideSection records for a Guide', async () => {
      const response = await testSession.get('/api/guides/sections?guideId=739bf09f-5670-45c9-9149-9d15710f03e7').expect(StatusCodes.OK);
      const data = response.body;
      assert(data);
      assert.deepStrictEqual(data.length, 4);
      assert.deepStrictEqual(data[0].name, 'Signing In');
      assert.deepStrictEqual(data[1].name, 'Selecting your Unit/Vehicle');
      assert.deepStrictEqual(data[2].name, 'Changing your Unit/Vehicle');
      assert.deepStrictEqual(data[3].name, 'Logging Out');
    });
  });

  describe('POST /', () => {
    it('creates a new GuideSection record', async () => {
      const response = await testSession
        .post('/api/guides/sections')
        .send({
          guideId: '739bf09f-5670-45c9-9149-9d15710f03e7',
          name: 'New Title',
          body: 'This is body text',
          position: 5,
          isVisible: false,
        })
        .expect(StatusCodes.CREATED);
      assert(response.body.id);
      const record = await models.GuideSection.findByPk(response.body.id);
      assert.deepStrictEqual(record.guideId, '739bf09f-5670-45c9-9149-9d15710f03e7');
      assert.deepStrictEqual(record.name, 'New Title');
      assert.deepStrictEqual(record.body, 'This is body text');
      assert.deepStrictEqual(record.position, 5);
      assert.deepStrictEqual(record.isVisible, false);
      assert.deepStrictEqual(record.createdById, '7f666fe4-dbdd-4c7f-ab44-d9157379a680');
      assert.deepStrictEqual(record.updatedById, '7f666fe4-dbdd-4c7f-ab44-d9157379a680');
    });
  });

  describe('PATCH /:id', () => {
    it('updates an existing GuideSection record', async () => {
      const response = await testSession
        .patch('/api/guides/sections/9f2ab3f6-9c99-4d7c-8b5d-62022c7afb5d')
        .send({
          name: 'Signing Out',
          body: 'With body',
          position: 10,
          isVisible: false,
        })
        .expect(StatusCodes.OK);
      assert.deepStrictEqual(response.body.id, '9f2ab3f6-9c99-4d7c-8b5d-62022c7afb5d');
      assert.deepStrictEqual(response.body.name, 'Signing Out');
      assert.deepStrictEqual(response.body.body, 'With body');
      assert.deepStrictEqual(response.body.position, 10);
      assert.deepStrictEqual(response.body.isVisible, false);

      const record = await models.GuideSection.findByPk('9f2ab3f6-9c99-4d7c-8b5d-62022c7afb5d');
      assert.deepStrictEqual(record.name, 'Signing Out');
      assert.deepStrictEqual(record.body, 'With body');
      assert.deepStrictEqual(record.position, 10);
      assert.deepStrictEqual(record.isVisible, false);
    });
  });

  describe('DELETE /:id', () => {
    it('deletes an existing GuideSection record', async () => {
      await testSession.delete('/api/guides/sections/9f2ab3f6-9c99-4d7c-8b5d-62022c7afb5d').expect(StatusCodes.OK);
      const record = await models.Export.findByPk('9f2ab3f6-9c99-4d7c-8b5d-62022c7afb5d');
      assert.deepStrictEqual(record, null);
    });
  });
});
