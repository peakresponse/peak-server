const assert = require('assert');

const helpers = require('../../helpers');

const models = require('../../../models');
const nemsisRepositories = require('../../../lib/nemsis/repositories');

const fccMocks = require('../../mocks/fcc');
const geonamesMocks = require('../../mocks/geonames');
const nemsisMocks = require('../../mocks/nemsis');

describe('models', () => {
  describe('State', () => {
    describe('.getAbbrForCode()', () => {
      it('should return the state abbreviation for a given code', () => {
        assert.deepStrictEqual(models.State.getAbbrForCode('06'), 'CA');
      });
    });

    describe('.getCodeForAbbr()', () => {
      it('should return the state code for a given abbreviation', () => {
        assert.deepStrictEqual(models.State.getCodeForAbbr('ca'), '06');
      });
    });

    describe('.getCodeForName()', () => {
      it('should return the state code for a given name', () => {
        assert.deepStrictEqual(models.State.getCodeForName('California'), '06');
      });
    });

    describe('.getNameForCode()', () => {
      it('should return the state name for a given code', () => {
        assert.deepStrictEqual(models.State.getNameForCode('06'), 'California');
      });
    });

    context('repositories', () => {
      before(async () => {
        const repo = nemsisRepositories.getNemsisStateRepo('50', '3.5.0');
        await repo.pull();
      });

      beforeEach(async () => {
        await helpers.loadFixtures(['cities', 'counties', 'states', 'users']);
      });

      describe('.importAgencies()', () => {
        it('imports Agency records from the specified NEMSIS State Data Set version', async function anon() {
          if (!process.env.CI) {
            this.skip();
          }
          const state = await models.State.findByPk('50');
          await state.importAgencies(
            '7f666fe4-dbdd-4c7f-ab44-d9157379a680',
            '3.5.0',
            '2023-02-21-001db2f318b31b46da54fb8891e195df6bb8947c'
          );
          assert.deepStrictEqual(await models.Agency.count(), 163);
        });
      });

      describe('.importFacilities()', () => {
        it('imports Facility records from the specified NEMSIS State Data Set version', async function anon() {
          if (!process.env.CI) {
            this.skip();
          }
          const state = await models.State.findByPk('50');
          await state.importFacilities(
            '7f666fe4-dbdd-4c7f-ab44-d9157379a680',
            '3.5.0',
            '2023-02-21-001db2f318b31b46da54fb8891e195df6bb8947c'
          );
          assert.deepStrictEqual(await models.Facility.count(), 388);
        });
      });
    });

    describe('.configure()', () => {
      // eslint-disable-next-line func-names
      it('should configure a Washington State record and associated Agency and Facility records', async function () {
        if (!process.env.CI) {
          this.skip();
        }

        await helpers.loadFixtures(['cities', 'counties', 'states', 'users']);

        fccMocks.mockPsapRegistryDownloads();
        geonamesMocks.mockWashingtonDownloads();
        nemsisMocks.mockReposRequest();
        nemsisMocks.mockWashingtonFilesRequest();
        nemsisMocks.mockWashingtonDownloads();

        const userId = '7f666fe4-dbdd-4c7f-ab44-d9157379a680';
        const state = await models.State.findByPk('53');
        assert(state);
        await state.configure(userId);
        assert.deepStrictEqual(state.name, 'Washington');
        assert.deepStrictEqual(await state.countAgencies(), 495);
        assert.deepStrictEqual(await models.Facility.count(), 159);
      });
    });
  });
});
