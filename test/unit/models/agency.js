const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');
const nemsisRepositories = require('../../../lib/nemsis/repositories');

describe('models', () => {
  describe('Agency', () => {
    beforeEach(async () => {
      await helpers.loadFixtures(['users', 'cities', 'states', 'counties', 'psaps', 'agencies', 'versions', 'employments', 'scenes']);
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

      it('validates that the data passes XSD', async () => {
        const agency = await models.Agency.findByPk('79628733-541b-4386-9e0a-d78929afeb9e');
        agency.data = {
          'dAgency.01': { _text: 'S38-50121' },
          'dAgency.02': { _text: 'S38-50121' },
          'dAgency.03': { _text: 'Bayshore Ambulance Draft' },
          'dAgency.04': { _text: '06' },
          'dAgency.AgencyServiceGroup': {
            _attributes: { UUID: 'efc2843f-d0aa-4d91-912b-e3a5c10ff7e1' },
            'dAgency.05': {},
            'dAgency.06': {},
            'dAgency.07': {},
            'dAgency.08': {},
          },
          'dAgency.09': {},
          'dAgency.11': {},
          'dAgency.12': {},
          'dAgency.13': {},
          'dAgency.14': {},
          'dAgency.25': {},
          'dAgency.26': {},
        };
        await agency.save();
        await agency.reload();
        assert(!agency.isValid);
        assert.deepStrictEqual(agency.validationErrors, {
          name: 'SchemaValidationError',
          errors: [
            {
              path: `$['dAgency.AgencyServiceGroup']['dAgency.05']`,
              message: 'This field is required.',
              value: '',
            },
            {
              path: `$['dAgency.AgencyServiceGroup']['dAgency.06']`,
              message: 'This field is required.',
              value: '',
            },
            {
              path: `$['dAgency.AgencyServiceGroup']['dAgency.07']`,
              message: 'This field is required.',
              value: '',
            },
            {
              path: `$['dAgency.AgencyServiceGroup']['dAgency.08']`,
              message: 'This field is required.',
              value: '',
            },
            {
              path: `$['dAgency.09']`,
              message: 'This field is required.',
              value: '',
            },
            {
              path: `$['dAgency.11']`,
              message: 'This field is required.',
              value: '',
            },
            {
              path: `$['dAgency.12']`,
              message: 'This field is required.',
              value: '',
            },
            {
              path: `$['dAgency.13']`,
              message: 'This field is required.',
              value: '',
            },
            {
              path: `$['dAgency.14']`,
              message: 'This field is required.',
              value: '',
            },
            {
              path: `$['dAgency.25']`,
              message: 'This field is required.',
              value: null,
            },
            {
              path: `$['dAgency.26']`,
              message: 'This field is required.',
              value: null,
            },
          ],
        });
      });
    });

    describe('getDraftVersion()', () => {
      it('returns null if no draft Version for an Agency', async () => {
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        assert.deepStrictEqual(await agency.getDraftVersion(), null);
      });

      it('returns the draft Version for an Agency', async () => {
        const agency = await models.Agency.findByPk('6bdc8680-9fa5-4ce3-86d9-7df940a7c4d8');
        const version = await agency.getDraftVersion();
        assert.deepStrictEqual(version?.id, '77df80da-09c6-484b-a5b7-04b1fd180c50');
      });

      it('cannot have more than one draft Version for an Agency', async () => {
        await assert.rejects(
          models.Version.create({
            agencyId: '6bdc8680-9fa5-4ce3-86d9-7df940a7c4d8',
            isDraft: true,
            nemsisVersion: '3.5.0.211008CP3',
            stateDataSetVersion: '2023-02-15-c07d8f9168fa7ef218657360f7efe6f464bc9632',
            stateSchematronVersion: '2023-02-17-5d0e21eff095d115b7e58e3fc7c39a040a2a00b4',
            createdById: '7f666fe4-dbdd-4c7f-ab44-d9157379a680',
            updatedById: '7f666fe4-dbdd-4c7f-ab44-d9157379a680',
          })
        );
      });
    });

    describe('getOrCreateDraftVersion()', () => {
      it('returns the existing draft Version for an Agency', async () => {
        const user = await models.User.findByPk('7f666fe4-dbdd-4c7f-ab44-d9157379a680');
        const agency = await models.Agency.findByPk('6bdc8680-9fa5-4ce3-86d9-7df940a7c4d8');
        const version = await agency.getOrCreateDraftVersion(user);
        assert.deepStrictEqual(version?.id, '77df80da-09c6-484b-a5b7-04b1fd180c50');
      });

      it('creates a new draft Version as needed', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const version = await agency.getOrCreateDraftVersion(user);
        assert.deepStrictEqual(version?.isDraft, true);
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
        const repo = nemsisRepositories.getNemsisStateRepo('06', '3.5.0');
        await repo.pull();

        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const canonicalAgency = await models.Agency.findByPk('5de082f2-3242-43be-bc2b-6e9396815b4f');
        assert.deepStrictEqual(canonicalAgency.data, {
          'sAgency.01': { _text: 'S66-50146' },
          'sAgency.02': { _text: 'S66-50146' },
          'sAgency.03': { _text: 'Bodega Bay Fire Protection District' },
        });

        let agency;
        await models.sequelize.transaction(async (transaction) => {
          agency = await models.Agency.register(user, canonicalAgency, 'bbfpd', { transaction });
        });
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
        assert.deepStrictEqual(agency.nemsisVersion, '3.5.0.211008CP3');
        assert.deepStrictEqual(agency.stateDataSetVersion, '2023-02-15-c07d8f9168fa7ef218657360f7efe6f464bc9632');
        assert.deepStrictEqual(agency.stateSchematronVersion, '2023-02-17-5d0e21eff095d115b7e58e3fc7c39a040a2a00b4');
        assert.deepStrictEqual(agency.data, {
          'dAgency.01': { _text: 'S66-50146' },
          'dAgency.02': { _text: 'S66-50146' },
          'dAgency.03': { _text: 'Bodega Bay Fire Protection District' },
          'dAgency.04': { _text: '06' },
        });

        const version = await agency.getVersion();
        assert(version);
        assert.deepStrictEqual(version.isDraft, false);
        assert.deepStrictEqual(version.nemsisVersion, '3.5.0.211008CP3');
        assert.deepStrictEqual(version.stateDataSetVersion, '2023-02-15-c07d8f9168fa7ef218657360f7efe6f464bc9632');
        assert.deepStrictEqual(version.stateSchematronVersion, '2023-02-17-5d0e21eff095d115b7e58e3fc7c39a040a2a00b4');

        const employment = await models.Employment.findOne({
          where: { agencyId: agency.id, userId: user.id },
        });
        assert(employment);
        assert(employment.isOwner);
        assert(employment.isActive);
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

    describe('updateDraft()', () => {
      it('creates a new draft as needed', async () => {
        const parent = await models.Agency.findByPk('6bdc8680-9fa5-4ce3-86d9-7df940a7c4d8');
        await parent.updateDraft({
          stateUniqueId: 'Test Id',
          number: 'Test Number',
          name: 'Test Name',
        });
        await parent.reload();
        // parent remains unchanged
        assert.deepStrictEqual(parent.stateUniqueId, 'S38-50827');
        assert.deepStrictEqual(parent.number, 'S38-50827');
        assert.deepStrictEqual(parent.name, 'San Francisco Fire Department');
        assert.deepStrictEqual(parent.data, {
          'dAgency.01': { _text: 'S38-50827' },
          'dAgency.02': { _text: 'S38-50827' },
          'dAgency.03': { _text: 'San Francisco Fire Department' },
          'dAgency.04': { _text: '06' },
        });

        const draft = await parent.getDraft();
        assert(draft);
        assert(draft.isDraft);
        assert.deepStrictEqual(draft.draftParentId, '6bdc8680-9fa5-4ce3-86d9-7df940a7c4d8');
        assert.deepStrictEqual(draft.stateUniqueId, 'Test Id');
        assert.deepStrictEqual(draft.number, 'Test Number');
        assert.deepStrictEqual(draft.name, 'Test Name');
        assert.deepStrictEqual(draft.data, {
          'dAgency.01': { _text: 'Test Id' },
          'dAgency.02': { _text: 'Test Number' },
          'dAgency.03': { _text: 'Test Name' },
          'dAgency.04': { _text: '06' },
        });
      });

      it('updates existing draft', async () => {
        const parent = await models.Agency.findByPk('81b433cd-5f48-4458-87f3-0bf4e1591830');
        await parent.updateDraft({
          stateUniqueId: 'Test Id',
          number: 'Test Number',
          name: 'Test Name',
        });
        await parent.reload();
        // parent remains unchanged
        assert.deepStrictEqual(parent.stateUniqueId, 'S38-50121');
        assert.deepStrictEqual(parent.number, 'S38-50121');
        assert.deepStrictEqual(parent.name, 'Bayshore Ambulance');
        assert.deepStrictEqual(parent.data, {
          'dAgency.01': { _text: 'S38-50121' },
          'dAgency.02': { _text: 'S38-50121' },
          'dAgency.03': { _text: 'Bayshore Ambulance' },
          'dAgency.04': { _text: '06' },
        });

        const draft = await parent.getDraft();
        assert(draft);
        assert(draft.isDraft);
        assert.deepStrictEqual(draft.id, '79628733-541b-4386-9e0a-d78929afeb9e');
        assert.deepStrictEqual(draft.draftParentId, '81b433cd-5f48-4458-87f3-0bf4e1591830');
        assert.deepStrictEqual(draft.stateUniqueId, 'Test Id');
        assert.deepStrictEqual(draft.number, 'Test Number');
        assert.deepStrictEqual(draft.name, 'Test Name');
        assert.deepStrictEqual(draft.data, {
          'dAgency.01': { _text: 'Test Id' },
          'dAgency.02': { _text: 'Test Number' },
          'dAgency.03': { _text: 'Test Name' },
          'dAgency.04': { _text: '06' },
        });
      });
    });
  });
});
