const assert = require('assert');
const _ = require('lodash');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Contact', () => {
    let user;
    let dAgency;
    beforeEach(async () => {
      await helpers.loadFixtures(['users', 'states', 'agencies']);
      user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
      const agency = await models.Agency.findByPk('5de082f2-3242-43be-bc2b-6e9396815b4f');
      await models.sequelize.transaction(async (transaction) => {
        dAgency = await models.Agency.register(user, agency, 'bbfpd', {
          transaction,
        });
      });
    });

    describe('.save()', () => {
      it('populates columns from the data', async () => {
        const contact = models.Contact.build();
        contact.createdByAgencyId = dAgency.id;
        contact.createdById = user.id;
        contact.updatedById = user.id;
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
        contact.createdByAgencyId = dAgency.id;
        contact.createdById = user.id;
        contact.updatedById = user.id;
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
        await assert.rejects(contact.save(), (error) => {
          assert(error instanceof models.Sequelize.ValidationError);
          assert.strictEqual(error.errors.length, 1);
          const [errorItem] = error.errors;
          assert(errorItem instanceof models.Sequelize.ValidationErrorItem);
          const originalError = errorItem.original;
          assert(
            _.find(originalError.errors, {
              path: 'dContact.02',
              message: 'This is not a valid value.',
            })
          );
          assert(
            _.find(originalError.errors, {
              path: 'dContact.10',
              message: 'This is not a valid value.',
              value: '4155551234',
            })
          );
          return true;
        });
      });
    });
  });
});
