const assert = require('assert');
const { DateTime } = require('luxon');
const nodemailerMock = require('nodemailer-mock');
const timekeeper = require('timekeeper');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Employment', () => {
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
        'agencies',
        'versions',
        'employments',
      ]);
      user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
      agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
    });

    describe("scope('active')", () => {
      it('returns only active employments', async () => {
        const records = await models.Employment.scope('final', 'active').findAll();
        assert.deepStrictEqual(records.length, 6);
      });
    });

    describe("scope('role')", () => {
      it('returns only employments that satisfy the given role (owner satisfies all implicitly)', async () => {
        const records = await models.Employment.scope('final', { method: ['role', models.Employment.Roles.PERSONNEL] }).findAll();
        assert.deepStrictEqual(records.length, 4);
      });

      it('returns only active employments that satisfy the given role (owner satisfies all implicitly)', async () => {
        const records = await models.Employment.scope('final', { method: ['role', models.Employment.Roles.PERSONNEL] }, 'active').findAll();
        assert.deepStrictEqual(records.length, 3);
      });
    });

    describe('.isActive', () => {
      it('returns false if current datetime is past end date', async () => {
        const record = await models.Employment.findByPk('b0c2b79e-5905-417f-a790-ba77c1134d92');
        assert.deepStrictEqual(record.isActive, false);
      });

      it('returns true if current datetime is NOT past end date', async () => {
        timekeeper.freeze(DateTime.fromISO('2020-04-06').toJSDate());
        const record = await models.Employment.findByPk('b0c2b79e-5905-417f-a790-ba77c1134d92');
        assert.deepStrictEqual(record.isActive, true);
        timekeeper.reset();
      });
    });

    describe('.save()', () => {
      it('generates an invitation code for new personnal', async () => {
        const record = models.Employment.build();
        record.createdByAgencyId = agency.id;
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

    describe('.approve()', () => {
      it('approves a pending employment', async () => {
        const record = await models.Employment.scope('finalOrNew').findByPk('0544b426-2969-4f98-a458-e090cd3487e2');
        assert(record.isPending);
        assert(!record.isActive);
        await record.approve(user);
        assert(!record.isPending);
        assert(record.isActive);
        assert(record.approvedAt);
        assert.deepStrictEqual(record.approvedById, user.id);
      });
    });

    describe('.refuse()', () => {
      it('refuses a pending employment', async () => {
        const record = await models.Employment.scope('finalOrNew').findByPk('0544b426-2969-4f98-a458-e090cd3487e2');
        assert(record.isPending);
        assert(!record.isActive);
        await record.refuse(user);
        assert(!record.isPending);
        assert(!record.isActive);
        assert(record.refusedAt);
        assert.deepStrictEqual(record.refusedById, user.id);
      });
    });

    describe('.email', () => {
      it('also sets the Nemsis data elements when set directly', async () => {
        const record = models.Employment.build();
        record.email = 'john.doe@peakresponse.net';
        await record.validate();
        assert.deepStrictEqual(record.data['dPersonnel.10'], { _text: 'john.doe@peakresponse.net' });
      });
    });

    describe('.fullName', () => {
      it('parses out name parts from a string', async () => {
        const record = models.Employment.build();
        record.fullName = 'John Doe';
        assert.strictEqual(record.firstName, 'John');
        assert.strictEqual(record.lastName, 'Doe');

        record.fullName = 'Mary Jane Watson';
        assert.strictEqual(record.firstName, 'Mary');
        assert.strictEqual(record.middleName, 'Jane');
        assert.strictEqual(record.lastName, 'Watson');

        record.email = 'requiredtopassvalidation@test.com';
        await record.validate();
        assert.deepStrictEqual(record.data['dPersonnel.NameGroup'], {
          'dPersonnel.01': { _text: 'Watson' },
          'dPersonnel.02': { _text: 'Mary' },
          'dPersonnel.03': { _text: 'Jane' },
        });
      });
    });
  });
});
