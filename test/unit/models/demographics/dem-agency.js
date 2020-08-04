'use strict'

const assert = require('assert');
const _ = require('lodash');
const nock = require('nock');
const nodemailerMock = require('nodemailer-mock');

const helpers = require('../../../helpers');
const models = require('../../../../models');

describe('models', function() {
  describe('DemAgency', function() {
    beforeEach(async function() {
      await helpers.loadFixtures(['users', 'states', 'agencies']);
    });

    it('validates that the subdomain is a valid value', async function() {
      const agency = models.DemAgency.build();
      /// null is not valid
      await assert.rejects(async () => await agency.validate(), (err) => err.errors[0].path == 'subdomain');

      /// spaces are not valid
      agency.subdomain = "spaces not valid";
      await assert.rejects(async () => await agency.validate(), (err) => err.errors[0].path == 'subdomain');

      /// symbols other than hypen or underscore are not valid
      agency.subdomain = "notvalid!";
      await assert.rejects(async () => await agency.validate(), (err) => err.errors[0].path == 'subdomain');

      /// this is a valid domain
      agency.subdomain = "test1234";
      await assert.doesNotReject(async () => await agency.validate());

      /// hyphen is valid
      agency.subdomain = "test-1234";
      await assert.doesNotReject(async () => await agency.validate());

      /// underscore is valid
      agency.subdomain = "test_1234";
      await assert.doesNotReject(async () => await agency.validate());
    });

    describe('.register()', function() {
      it('creates a new demographic Agency record for a given Agency/User', async function() {
        const user = await models.User.findByPk("ffc7a312-50ba-475f-b10f-76ce793dc62a");
        const agency = await models.Agency.findByPk("5de082f2-3242-43be-bc2b-6e9396815b4f");
        assert.deepStrictEqual(agency.data, {
          'sAgency.01': { _text: 'S66-50146' },
          'sAgency.02': { _text: 'S66-50146' },
          'sAgency.03': { _text: 'Bodega Bay Fire Protection District' }
        });

        await models.sequelize.transaction(async transaction => {
          const dAgency = await models.DemAgency.register(user, agency, "bbfpd", {transaction});
          assert(dAgency);
          assert.strictEqual(dAgency.subdomain, 'bbfpd');
          assert.strictEqual(dAgency.createdById, user.id);
          assert.strictEqual(dAgency.updatedById, user.id);
          assert.strictEqual(dAgency.agencyId, agency.id);
          assert.strictEqual(dAgency.createdById, user.id);
          assert.strictEqual(dAgency.updatedById, user.id);
          assert(dAgency.data, {
            'dAgency.01': { _text: 'S66-50146' },
            'dAgency.02': { _text: 'S66-50146' },
            'dAgency.03': { _text: 'Bodega Bay Fire Protection District' },
            'dAgency.04': { _text: '06'}
          });

          const employment = await models.Employment.findOne({where: {agencyId: dAgency.id, userId: user.id}, transaction});
          assert(employment);
          assert(employment.isOwner);
          assert(employment.isActive);
        });
      });
    });
  });
});
