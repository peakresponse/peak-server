const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Contact', () => {
    let user;
    let agency;
    beforeEach(async () => {
      await helpers.loadFixtures([
        'users',
        'states',
        'counties',
        'cities',
        'psaps',
        'nemsisStateDataSets',
        'nemsisSchematrons',
        'regions',
        'agencies',
        'versions',
      ]);
      user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
      agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
    });

    describe('.save()', () => {
      it('populates columns from the data', async () => {
        const contact = models.Contact.build();
        contact.createdByAgencyId = agency.id;
        contact.createdById = user.id;
        contact.updatedById = user.id;
        contact.versionId = agency.versionId;
        contact.data = {
          _attributes: {
            UUID: '5c0a380c-0f69-4533-bf6b-5238a2f02d10',
          },
          'dContact.01': {
            _text: '1101009',
          },
          'dContact.02': {
            _text: 'Doe',
          },
          'dContact.03': {
            _text: 'John',
          },
          'dContact.04': {
            _text: 'M',
          },
          'dContact.10': {
            _text: '415-555-1234',
          },
          'dContact.11': [
            {
              _text: 'john@doe.com',
            },
            {
              _text: 'johnmdoe@gmail.com',
            },
          ],
        };
        await contact.save();
        assert.strictEqual(contact.id, '5c0a380c-0f69-4533-bf6b-5238a2f02d10');
        assert.strictEqual(contact.type, '1101009');
        assert.strictEqual(contact.lastName, 'Doe');
        assert.strictEqual(contact.firstName, 'John');
        assert.strictEqual(contact.middleName, 'M');
        assert.strictEqual(contact.primaryPhone, '415-555-1234');
        assert.strictEqual(contact.primaryEmail, 'john@doe.com');
      });

      it('validates its data against NEMSIS xsd', async () => {
        const contact = models.Contact.build();
        contact.createdByAgencyId = agency.id;
        contact.createdById = user.id;
        contact.updatedById = user.id;
        contact.versionId = agency.versionId;
        contact.data = {
          _attributes: {
            UUID: '5c0a380c-0f69-4533-bf6b-5238a2f02d10',
          },
          'dContact.02': {
            _text: '',
          },
          'dContact.10': {
            _text: '4155551234',
          },
        };
        await contact.save();
        assert(!contact.isValid);
        assert.deepStrictEqual(contact.validationErrors, {
          name: 'SchemaValidationError',
          errors: [
            {
              path: `$['dContact.ContactInfoGroup']['dContact.02']`,
              message: 'This field is required.',
              value: null,
            },
            {
              path: `$['dContact.ContactInfoGroup']['dContact.10']`,
              message: 'This is not a valid value.',
              value: '4155551234',
            },
          ],
        });
      });
    });
  });
});
