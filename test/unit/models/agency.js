const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Agency', () => {
    beforeEach(async () => {
      await helpers.loadFixtures(['users', 'cities', 'states', 'agencies', 'employments', 'scenes']);
    });

    describe("scope('canonical')", () => {
      it('filters out non-canonical records', async () => {
        assert.deepStrictEqual(await models.Agency.scope('canonical').count(), 12);
      });
    });

    describe("scope('claimed')", () => {
      it('filters out non-claimed records', async () => {
        assert.deepStrictEqual(await models.Agency.scope('claimed').count(), 3);
      });
    });

    describe('getUsers()', () => {
      it('returns users associated with this agency', async () => {
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const users = await agency.getUsers();
        assert.deepStrictEqual(users.length, 5);
      });
    });

    describe('getActiveUsers()', () => {
      it('returns only active users associated with this agency', async () => {
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const users = await agency.getActiveUsers();
        assert.deepStrictEqual(users.length, 2);
      });
    });

    describe('getActivePersonnelAdminUsers()', () => {
      it('returns only active users with personnel admin role associated with this agency', async () => {
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const users = await agency.getActivePersonnelAdminUsers();
        assert.deepStrictEqual(users.length, 2);
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
        /// add placeholder values for other required fields
        agency.stateUniqueId = 'TEST-001';
        agency.number = 'TEST-001';

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
          _attributes: {
            UUID: '5de082f2-3242-43be-bc2b-6e9396815b4f',
          },
          'sAgency.01': { _text: 'S66-50146' },
          'sAgency.02': { _text: 'S66-50146' },
          'sAgency.03': { _text: 'Bodega Bay Fire Protection District' },
        });

        await models.sequelize.transaction(async (transaction) => {
          const agency = await models.Agency.register(user, canonicalAgency, 'bbfpd', { transaction });
          assert(agency);
          assert.deepStrictEqual(agency.canonicalAgencyId, canonicalAgency.id);
          assert.deepStrictEqual(agency.stateId, '06');
          assert.deepStrictEqual(agency.stateUniqueId, 'S66-50146');
          assert.deepStrictEqual(agency.number, 'S66-50146');
          assert.deepStrictEqual(agency.subdomain, 'bbfpd');
          assert.deepStrictEqual(agency.createdById, user.id);
          assert.deepStrictEqual(agency.updatedById, user.id);
          assert.deepStrictEqual(agency.createdById, user.id);
          assert.deepStrictEqual(agency.updatedById, user.id);
          assert.deepStrictEqual(agency.data, {
            'dAgency.01': { _text: 'S66-50146' },
            'dAgency.02': { _text: 'S66-50146' },
            'dAgency.03': { _text: 'Bodega Bay Fire Protection District' },
            'dAgency.04': { _text: '06' },
            _attributes: {
              UUID: agency.id,
            },
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

    describe('update()', () => {
      it('syncs columns and Nemsis data on save', async () => {
        let agency = await models.Agency.findByPk('9466185d-6ad7-429a-9081-4426d2398f9f');
        await agency.update({
          stateUniqueId: 'Test Id',
          number: 'Test Number',
          name: 'Test Name',
        });
        await agency.reload();
        assert.deepStrictEqual(agency.data, {
          'sAgency.01': { _text: 'Test Id' },
          'sAgency.02': { _text: 'Test Number' },
          'sAgency.03': { _text: 'Test Name' },
        });

        agency.setNemsisValue(['sAgency.01'], 'Sync Id');
        agency.setNemsisValue(['sAgency.02'], 'Sync Number');
        agency.setNemsisValue(['sAgency.03'], 'Sync Name');
        await agency.save();
        assert.deepStrictEqual(agency.stateUniqueId, 'Sync Id');
        assert.deepStrictEqual(agency.number, 'Sync Number');
        assert.deepStrictEqual(agency.name, 'Sync Name');

        agency = await models.Agency.findByPk('6bdc8680-9fa5-4ce3-86d9-7df940a7c4d8');
        await agency.update({
          stateId: '01',
          stateUniqueId: 'Test Id',
          number: 'Test Number',
          name: 'Test Name',
        });
        assert.deepStrictEqual(agency.data, {
          'dAgency.01': { _text: 'Test Id' },
          'dAgency.02': { _text: 'Test Number' },
          'dAgency.03': { _text: 'Test Name' },
          'dAgency.04': { _text: '01' },
          _attributes: {
            UUID: agency.id,
          },
        });

        agency.setNemsisValue(['dAgency.01'], 'Sync Id');
        agency.setNemsisValue(['dAgency.02'], 'Sync Number');
        agency.setNemsisValue(['dAgency.03'], 'Sync Name');
        agency.setNemsisValue(['dAgency.04'], '06');
        await agency.save();
        assert.deepStrictEqual(agency.stateUniqueId, 'Sync Id');
        assert.deepStrictEqual(agency.number, 'Sync Number');
        assert.deepStrictEqual(agency.name, 'Sync Name');
        assert.deepStrictEqual(agency.stateId, '06');
      });
    });
  });
});
