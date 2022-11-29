const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../../helpers');
const app = require('../../../../app');
const models = require('../../../../models');

describe('/api/demographics/forms', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures(['users', 'states', 'counties', 'cities', 'psaps', 'agencies', 'employments', 'forms']);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(200);
  });

  describe('GET /', () => {
    it('returns a list of Forms for the current agency', async () => {
      const response = await testSession.get('/api/demographics/forms').set('Host', `bmacc.${process.env.BASE_HOST}`).expect(HttpStatus.OK);
      const forms = response.body;
      assert.deepStrictEqual(forms.length, 2);
      assert.deepStrictEqual(forms[0].title, 'Patient / Patient Representative');
      assert.deepStrictEqual(forms[1].title, 'Patient Refusal Against Medical Advice');
    });
  });

  describe('POST /', () => {
    it('creates a new Form in the current agency', async () => {
      const data = {
        id: '6903bed3-84e7-479b-93b4-720e9cba01f7',
        canonicalId: '9507714c-8c11-44d4-94ca-511403ed08b2',
        title: 'Patient Refuses Transport',
        body: 'Lorem ipsum 3',
        reasons: [
          {
            code: '4513021',
          },
        ],
        signatures: [
          {
            title: 'Patient / Patient Representative',
            types: ['4512015', '4512017'],
          },
          {
            title: 'Paramedic',
            types: ['4512003', '4512001'],
            condition: {
              status: 'refused',
            },
          },
          {
            title: 'Paramedic / EMT',
            types: ['4512003', '4512001'],
            condition: {
              status: 'refused',
            },
          },
        ],
      };
      const response = await testSession
        .post('/api/demographics/forms')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send(data)
        .expect(HttpStatus.CREATED);
      assert(response.body.id);

      const form = await models.Form.findByPk(response.body.id);
      assert(form);
      assert.deepStrictEqual(form.id, data.id);
      assert.deepStrictEqual(form.canonicalId, data.canonicalId);
      assert.deepStrictEqual(form.createdByAgencyId, '9eeb6591-12f8-4036-8af8-6b235153d444');
      assert.deepStrictEqual(form.title, data.title);
      assert.deepStrictEqual(form.body, data.body);
      assert.deepStrictEqual(form.reasons, data.reasons);
      assert.deepStrictEqual(form.signatures, data.signatures);
      assert.deepStrictEqual(form.updatedAttributes, ['id', 'canonicalId', 'title', 'body', 'reasons', 'signatures']);
      assert.deepStrictEqual(form.createdById, 'ffc7a312-50ba-475f-b10f-76ce793dc62a');
      assert.deepStrictEqual(form.updatedById, 'ffc7a312-50ba-475f-b10f-76ce793dc62a');
    });

    it('updates an existing Form in the current agency', async () => {
      const data = {
        id: '873ac070-ea7a-4478-9e20-d61bbd3ea5d9',
        parentId: '57e6bb7b-c08c-4691-9185-23864b4850ab',
        title: '',
        body: '',
        reasons: [],
        signatures: [],
      };
      await testSession.post(`/api/demographics/forms`).set('Host', `bmacc.${process.env.BASE_HOST}`).send(data).expect(HttpStatus.OK);

      const canonical = await models.Form.findByPk('98f2c8bd-8019-4ec4-918d-3ce54f9427b2');
      assert(canonical);
      assert.deepStrictEqual(canonical.currentId, data.id);
      assert.deepStrictEqual(canonical.createdByAgencyId, '9eeb6591-12f8-4036-8af8-6b235153d444');
      assert.deepStrictEqual(canonical.title, data.title);
      assert.deepStrictEqual(canonical.body, data.body);
      assert.deepStrictEqual(canonical.reasons, data.reasons);
      assert.deepStrictEqual(canonical.signatures, data.signatures);

      const current = await canonical.getCurrent();
      assert.deepStrictEqual(current.canonicalId, '98f2c8bd-8019-4ec4-918d-3ce54f9427b2');
      assert.deepStrictEqual(current.parentId, data.parentId);
      assert.deepStrictEqual(current.createdByAgencyId, '9eeb6591-12f8-4036-8af8-6b235153d444');
      assert.deepStrictEqual(current.title, data.title);
      assert.deepStrictEqual(current.body, data.body);
      assert.deepStrictEqual(current.reasons, data.reasons);
      assert.deepStrictEqual(current.signatures, data.signatures);
    });
  });

  describe('DELETE /:id', () => {
    it('marks a Form as archived', async () => {
      await testSession
        .delete(`/api/demographics/forms/98f2c8bd-8019-4ec4-918d-3ce54f9427b2`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(HttpStatus.OK);
      const canonical = await models.Form.findByPk('98f2c8bd-8019-4ec4-918d-3ce54f9427b2');
      assert(canonical);
      assert(canonical.archivedAt);
    });
  });
});
