const assert = require('assert');
const HttpStatus = require('http-status-codes');
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
        .expect(HttpStatus.OK);
      const contacts = response.body;
      assert(Array.isArray(contacts.dContact?.['dContact.ContactInfoGroup']));
      assert.strictEqual(contacts.dContact['dContact.ContactInfoGroup'].length, 2);
    });
  });

  describe('POST /', () => {
    it('creates a new contact in the current agency', async () => {
      const response = await testSession
        .post('/api/demographics/contacts')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
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
        })
        .expect(HttpStatus.CREATED);
      const data = response.body;
      assert(data._attributes?.UUID);
      const contact = await models.Contact.findByPk(data._attributes?.UUID);
      assert(contact);
      assert.strictEqual(contact.id, 'bce2b087-302e-47fb-9852-362f7c2b30b5');
      assert.strictEqual(contact.createdByAgencyId, '9eeb6591-12f8-4036-8af8-6b235153d444');
      assert.strictEqual(contact.type, '1101017');
      assert.strictEqual(contact.lastName, 'Contact');
      assert.strictEqual(contact.firstName, 'Other');
      assert.strictEqual(contact.primaryPhone, '415-555-1111');
      assert.strictEqual(contact.primaryEmail, 'other@contact.com');
    });
  });

  describe('PUT /', () => {
    it('updates an existing contact in the current agency', async () => {
      await testSession
        .put(`/api/demographics/contacts/f77a0e3b-3f09-4891-bd89-924e6d36481d`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
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
        })
        .expect(HttpStatus.NO_CONTENT);
      const contact = await models.Contact.findByPk('f77a0e3b-3f09-4891-bd89-924e6d36481d');
      assert(contact);
      assert.strictEqual(contact.createdByAgencyId, '9eeb6591-12f8-4036-8af8-6b235153d444');
      assert.strictEqual(contact.type, '1101001');
      assert.strictEqual(contact.lastName, 'Assist');
      assert.strictEqual(contact.firstName, 'Admin');
      assert.strictEqual(contact.middleName, 'A');
      assert.strictEqual(contact.primaryPhone, '415-555-2222');
      assert.strictEqual(contact.primaryEmail, 'admin@assist.com');
    });
  });
});
