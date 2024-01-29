const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../../helpers');
const app = require('../../../../app');
const models = require('../../../../models');

describe('/api/demographics/contacts', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'users',
      'states',
      'counties',
      'cities',
      'psaps',
      'nemsisStateDataSets',
      'nemsisSchematrons',
      'agencies',
      'versions',
      'contacts',
      'employments',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(200);
  });

  describe('GET /', () => {
    it('returns a list of contacts in the current agency', async () => {
      const response = await testSession
        .get('/api/demographics/contacts')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(StatusCodes.OK);
      const records = response.body;
      assert.strictEqual(records?.length, 2);
    });
  });

  describe('POST /', () => {
    it('creates a new contact in the current agency', async () => {
      const data = {
        _attributes: {
          UUID: 'bce2b087-302e-47fb-9852-362f7c2b30b5',
        },
        'dContact.01': {
          _text: '1101017',
        },
        'dContact.02': {
          _text: 'Contact',
        },
        'dContact.03': {
          _text: 'Other',
        },
        'dContact.10': {
          _text: '415-555-1111',
        },
        'dContact.11': {
          _text: 'other@contact.com',
        },
      };
      const response = await testSession
        .post('/api/demographics/contacts')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({ data })
        .expect(StatusCodes.CREATED);

      function assertRecord(record) {
        assert(record.id);
        assert(record.id === record.data._attributes.UUID);
        assert(record.isDraft);
        assert(record.isValid);
        assert.deepStrictEqual(record.validationErrors, null);
        assert.deepStrictEqual(record.data, data);
      }
      assertRecord(response.body);
      assertRecord(await models.Contact.findByPk(response.body.id));
    });
  });

  describe('PUT /', () => {
    it('creates a new draft edit of an existing record', async () => {
      const data = {
        _attributes: {
          UUID: 'f77a0e3b-3f09-4891-bd89-924e6d36481d',
        },
        'dContact.01': {
          _text: '1101001',
        },
        'dContact.02': {
          _text: 'Assist',
        },
        'dContact.03': {
          _text: 'Admin',
        },
        'dContact.04': {
          _text: 'A',
        },
        'dContact.10': {
          _text: '415-555-2222',
        },
        'dContact.11': {
          _text: 'admin@assist.com',
        },
      };
      const response = await testSession
        .put(`/api/demographics/contacts/f77a0e3b-3f09-4891-bd89-924e6d36481d`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({ data })
        .expect(StatusCodes.OK);

      assert.deepStrictEqual(response.body.data, data);

      const record = await models.Contact.findByPk('f77a0e3b-3f09-4891-bd89-924e6d36481d');
      const draft = await record.getDraft();
      assert(draft);
      assert(draft.isValid);
      assert.deepStrictEqual(draft.data, data);
      assert.strictEqual(draft.createdByAgencyId, '9eeb6591-12f8-4036-8af8-6b235153d444');
      assert.strictEqual(draft.type, '1101001');
      assert.strictEqual(draft.lastName, 'Assist');
      assert.strictEqual(draft.firstName, 'Admin');
      assert.strictEqual(draft.middleName, 'A');
      assert.strictEqual(draft.primaryPhone, '415-555-2222');
      assert.strictEqual(draft.primaryEmail, 'admin@assist.com');
    });
  });
});
