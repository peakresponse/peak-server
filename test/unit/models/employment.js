const assert = require('assert');
const nodemailerMock = require('nodemailer-mock');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Employment', () => {
    let user;
    let agency;
    beforeEach(async () => {
      await helpers.loadFixtures(['users', 'states', 'agencies']);
      user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
      agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
    });

    describe('.save()', () => {
      it('generates an invitation code for new personnal', async () => {
        const record = models.Employment.build();
        record.agencyId = agency.id;
        record.createdById = user.id;
        record.updatedById = user.id;
        record.data = {
          _attributes: {
            UUID: '5c0a380c-0f69-4533-bf6b-5238a2f02d10',
          },
          'dPersonnel.NameGroup': {
            'dPersonnel.01': {
              _text: 'Smith',
            },
            'dPersonnel.02': {
              _text: 'John',
            },
            'dPersonnel.03': {
              _text: 'D',
            },
          },
          'dPersonnel.10': {
            _text: 'johndsmith@peakresponse.net',
          },
        };
        await record.save();
        assert.strictEqual(record.id, '5c0a380c-0f69-4533-bf6b-5238a2f02d10');
        assert.strictEqual(record.lastName, 'Smith');
        assert.strictEqual(record.firstName, 'John');
        assert.strictEqual(record.middleName, 'D');
        assert.strictEqual(record.email, 'johndsmith@peakresponse.net');
        assert(record.invitationCode);
        assert(record.invitationAt);
        const emails = nodemailerMock.mock.getSentMail();
        assert.strictEqual(emails.length, 1);
        assert.strictEqual(emails[0].subject, `You're invited to join Bay Medic Ambulance - Contra Costa on Peak Response`);
        assert.strictEqual(emails[0].to, 'John D Smith <johndsmith@peakresponse.net>');
        assert(emails[0].html.indexOf(`http://bmacc.${process.env.BASE_HOST}:3000/sign-up?invitationCode=${record.invitationCode}`) >= 0);
        assert(emails[0].text.indexOf(`http://bmacc.${process.env.BASE_HOST}:3000/sign-up?invitationCode=${record.invitationCode}`) >= 0);
      });
    });

    describe('.email', () => {
      it('also sets the Nemsis data elements when set directly', () => {
        const record = models.Employment.build();
        record.email = 'john.doe@peakresponse.net';
        assert.deepStrictEqual(record.data, {
          'dPersonnel.10': { _text: 'john.doe@peakresponse.net' },
        });
      });
    });

    describe('.fullName', () => {
      it('parses out name parts from a string', () => {
        const record = models.Employment.build();
        record.fullName = 'John Doe';
        assert.strictEqual(record.firstName, 'John');
        assert.strictEqual(record.lastName, 'Doe');

        record.fullName = 'Mary Jane Watson';
        assert.strictEqual(record.firstName, 'Mary');
        assert.strictEqual(record.middleName, 'Jane');
        assert.strictEqual(record.lastName, 'Watson');

        assert.deepStrictEqual(record.data, {
          'dPersonnel.NameGroup': {
            'dPersonnel.01': { _text: 'Watson' },
            'dPersonnel.02': { _text: 'Mary' },
            'dPersonnel.03': { _text: 'Jane' },
          },
        });
      });
    });
  });
});
