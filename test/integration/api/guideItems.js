const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');

const app = require('../../../app');
const models = require('../../../models');

describe('/api/guides/items', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures(['states', 'counties', 'cities', 'users', 'guides', 'guideSections', 'guideItems']);
    testSession = session(app);
    await testSession.post('/login').send({ email: 'admin@peakresponse.net', password: 'abcd1234' }).expect(StatusCodes.OK);
  });

  describe('GET /', () => {
    it('returns all GuideItem records for a GuideSection', async () => {
      const response = await testSession.get('/api/guides/items?sectionId=a0f93c54-0886-4a6f-8339-3b3a72859bc8').expect(StatusCodes.OK);
      const data = response.body;
      assert(data);
      assert.deepStrictEqual(data.length, 3);
      assert.deepStrictEqual(data[0].body, 'This is step 1');
      assert.deepStrictEqual(data[1].body, 'This is step 2');
      assert.deepStrictEqual(data[2].body, 'This is step 3');
    });
  });

  describe('POST /', () => {
    it('creates a new GuideItem record', async () => {
      const response = await testSession
        .post('/api/guides/items')
        .send({
          sectionId: 'a0f93c54-0886-4a6f-8339-3b3a72859bc8',
          body: 'This is step 4',
          position: 4,
          isVisible: false,
        })
        .expect(StatusCodes.CREATED);
      assert(response.body.id);
      const record = await models.GuideItem.findByPk(response.body.id);
      assert.deepStrictEqual(record.sectionId, 'a0f93c54-0886-4a6f-8339-3b3a72859bc8');
      assert.deepStrictEqual(record.body, 'This is step 4');
      assert.deepStrictEqual(record.position, 4);
      assert.deepStrictEqual(record.isVisible, false);
      assert.deepStrictEqual(record.createdById, '7f666fe4-dbdd-4c7f-ab44-d9157379a680');
      assert.deepStrictEqual(record.updatedById, '7f666fe4-dbdd-4c7f-ab44-d9157379a680');
    });
  });

  describe('PATCH /:id', () => {
    it('updates an existing GuideItem record', async () => {
      const response = await testSession
        .patch('/api/guides/items/79ca593d-044d-486c-8561-c7532f5447fb')
        .send({
          body: 'New body 1',
          position: 10,
          isVisible: false,
        })
        .expect(StatusCodes.OK);
      assert.deepStrictEqual(response.body.id, '79ca593d-044d-486c-8561-c7532f5447fb');
      assert.deepStrictEqual(response.body.body, 'New body 1');
      assert.deepStrictEqual(response.body.position, 10);
      assert.deepStrictEqual(response.body.isVisible, false);

      const record = await models.GuideItem.findByPk('79ca593d-044d-486c-8561-c7532f5447fb');
      assert.deepStrictEqual(record.body, 'New body 1');
      assert.deepStrictEqual(record.position, 10);
      assert.deepStrictEqual(record.isVisible, false);
    });
  });

  describe('DELETE /:id', () => {
    it('deletes an existing GuideItem record', async () => {
      await testSession.delete('/api/guides/items/79ca593d-044d-486c-8561-c7532f5447fb').expect(StatusCodes.OK);
      const record = await models.GuideItem.findByPk('79ca593d-044d-486c-8561-c7532f5447fb');
      assert.deepStrictEqual(record, null);
    });
  });
});
