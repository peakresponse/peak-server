const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Agency', () => {
    beforeEach(async () => {
      await helpers.loadFixtures(['users', 'states', 'agencies', 'scenes']);
    });

    describe("scope('canonical')", () => {
      it('filters out non-canonical records', async () => {
        assert.deepStrictEqual(await models.Agency.scope('canonical').count(), 11);
      });
    });

    describe("scope('claimed')", () => {
      it('filters out non-claimed records', async () => {
        assert.deepStrictEqual(await models.Agency.scope('claimed').count(), 2);
      });
    });

    describe('getActiveScenes()', () => {
      it('returns active scenes accessible to this agency', async () => {
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const scenes = await agency.getActiveScenes();
        assert.deepStrictEqual(scenes.length, 1);
        assert.deepStrictEqual(scenes[0].id, '25db9094-03a5-4267-8314-bead229eff9d');
      });
    });

    describe('validate()', () => {
      it('validates that a subdomain is a valid value', async () => {
        const agency = models.Agency.build();

        /// spaces are not valid
        agency.subdomain = 'spaces not valid';
        await assert.rejects(agency.validate(), (err) => err.errors[0].path === 'subdomain');

        /// symbols other than hypen or underscore are not valid
        agency.subdomain = 'notvalid!';
        await assert.rejects(agency.validate(), (err) => err.errors[0].path === 'subdomain');

        /// this is a valid domain
        agency.subdomain = 'test1234';
        await assert.doesNotReject(agency.validate());

        /// hyphen is valid
        agency.subdomain = 'test-1234';
        await assert.doesNotReject(agency.validate());

        /// underscore is valid
        agency.subdomain = 'test_1234';
        await assert.doesNotReject(agency.validate());
      });
    });

    describe('generateSubdomain()', () => {
      it('should generate a unique, unused subdomain from a short name (less than 4 words)', async () => {
        const agency = await models.Agency.findByPk('6b7ceef6-0be4-4791-848d-f115e8f15182');
        const subdomain = await agency.generateSubdomain();
        assert.deepStrictEqual(subdomain, 'humboldtbayfire');
      });

      it('should generate a unique, unused subdomain from an acronym of the name (more than 3 words)', async () => {
        const agency = await models.Agency.findByPk('5de082f2-3242-43be-bc2b-6e9396815b4f');
        const subdomain = await agency.generateSubdomain();
        assert.deepStrictEqual(subdomain, 'bbfpd');
      });

      it('should add a numberic suffix if the generated name is taken', async () => {
        const agency = await models.Agency.findByPk('2d9824fc-5d56-43cb-b7f0-e748a1c1ef4d');
        const subdomain = await agency.generateSubdomain();
        assert.deepStrictEqual(subdomain, 'bmacc1');
      });
    });

    describe('register()', () => {
      it('creates a new demographic Agency record for a given Agency/User', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const canonicalAgency = await models.Agency.findByPk('5de082f2-3242-43be-bc2b-6e9396815b4f');
        assert.deepStrictEqual(canonicalAgency.data, {
          'sAgency.01': { _text: 'S66-50146' },
          'sAgency.02': { _text: 'S66-50146' },
          'sAgency.03': { _text: 'Bodega Bay Fire Protection District' },
        });

        await models.sequelize.transaction(async (transaction) => {
          const agency = await models.Agency.register(user, canonicalAgency, 'bbfpd', { transaction });
          assert(agency);
          assert.strictEqual(agency.canonicalAgencyId, canonicalAgency.id);
          assert.strictEqual(agency.subdomain, 'bbfpd');
          assert.strictEqual(agency.createdById, user.id);
          assert.strictEqual(agency.updatedById, user.id);
          assert.strictEqual(agency.createdById, user.id);
          assert.strictEqual(agency.updatedById, user.id);
          assert(agency.data, {
            'dAgency.01': { _text: 'S66-50146' },
            'dAgency.02': { _text: 'S66-50146' },
            'dAgency.03': { _text: 'Bodega Bay Fire Protection District' },
            'dAgency.04': { _text: '06' },
          });

          const employment = await models.Employment.findOne({
            where: { agencyId: agency.id, userId: user.id },
            transaction,
          });
          assert(employment);
          assert(employment.isOwner);
          assert(employment.isActive);
        });
      });
    });
  });
});
