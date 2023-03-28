const assert = require('assert');

const helpers = require('../../helpers');

const models = require('../../../models');
const nemsisStates = require('../../../lib/nemsis/states');

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
        const repo = nemsisStates.getNemsisStateRepo('50', '3.5.0');
        await repo.pull();
      });

      beforeEach(async () => {
        await helpers.loadFixtures(['cities', 'counties', 'states', 'users']);
      });

      describe('.importAgencies()', () => {
        it('imports Agency records from the specified NEMSIS State Data Set version', async function anon() {
          if (!process.env.CI) {
            this.skip();
            return;
          }
          const state = await models.State.findByPk('50');
          await state.importAgencies(
            '7f666fe4-dbdd-4c7f-ab44-d9157379a680',
            '3.5.0',
            '2023-02-21-001db2f318b31b46da54fb8891e195df6bb8947c'
          );
          assert.deepStrictEqual(await models.Agency.count(), 163);
          await state.reload();
          assert.deepStrictEqual(state.status, { code: 202, message: 'Imported 163 Agencies' });
        });
      });

      describe('.importFacilities()', () => {
        it('imports Facility records from the specified NEMSIS State Data Set version', async function anon() {
          if (!process.env.CI) {
            this.skip();
            return;
          }
          const state = await models.State.findByPk('50');
          await state.importFacilities(
            '7f666fe4-dbdd-4c7f-ab44-d9157379a680',
            '3.5.0',
            '2023-02-21-001db2f318b31b46da54fb8891e195df6bb8947c'
          );
          assert.deepStrictEqual(await models.Facility.count(), 388);
          await state.reload();
          assert.deepStrictEqual(state.status, { code: 202, message: 'Imported 388 Facilities' });
        });
      });
    });
  });
});
