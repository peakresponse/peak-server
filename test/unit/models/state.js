const assert = require('assert');
const fs = require('fs-extra');
const { mkdirp } = require('mkdirp');
const path = require('path');
const uuid = require('uuid/v4');

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
      let repo;
      before(async () => {
        repo = nemsisStates.getNemsisStateRepo('50', '3.5.0');
        await repo.pull();
      });

      beforeEach(async () => {
        await helpers.loadFixtures(['cities', 'counties', 'states', 'users', 'nemsisStateDataSets']);
      });

      describe('.importAgencies()', () => {
        it('imports Agency records from the specified NEMSIS State Data Set version', async () => {
          const stateDataSet = await models.NemsisStateDataSet.findByPk('1301f4e2-87b9-486a-b3d0-61a46d703b44');
          const state = await models.State.findByPk('50');
          await state.importAgencies('7f666fe4-dbdd-4c7f-ab44-d9157379a680', stateDataSet);
          assert.deepStrictEqual(await models.Agency.count(), 163);
          await state.reload();
          assert.deepStrictEqual(state.status, { code: 202, message: 'Imported 163 Agencies' });
        });
      });

      describe('.importFacilities()', () => {
        it('imports Facility records from the specified NEMSIS State Data Set version', async () => {
          const stateDataSet = await models.NemsisStateDataSet.findByPk('1301f4e2-87b9-486a-b3d0-61a46d703b44');
          const state = await models.State.findByPk('50');
          await state.importFacilities('7f666fe4-dbdd-4c7f-ab44-d9157379a680', stateDataSet);
          assert.deepStrictEqual(await models.Facility.count(), 390);
          await state.reload();
          assert.deepStrictEqual(state.status, { code: 202, message: 'Imported 390 Facilities' });
        });
      });
    });

    context('external state data set file', () => {
      let file;
      let stateDataSet;

      beforeEach(async () => {
        await helpers.loadFixtures(['cities', 'counties', 'states', 'users', 'nemsisStateDataSets']);
        file = `${uuid()}.png`;
        mkdirp.sync(path.resolve(__dirname, '../../../tmp/uploads'));
        fs.copySync(
          path.resolve(__dirname, '../../fixtures/nemsis/full/2023-STATE-1_v350.xml'),
          path.resolve(__dirname, `../../../tmp/uploads/${file}`)
        );
        stateDataSet = await models.NemsisStateDataSet.create({
          stateId: '05',
          nemsisVersion: '3.5.0.211008CP3',
          file,
          createdById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          updatedById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
        });
      });

      afterEach(() => {
        fs.removeSync(path.resolve(__dirname, `../../../tmp/uploads/${file}`));
        fs.removeSync(path.resolve(__dirname, `../../../public/assets/test`));
      });

      it('imports Agency records from the specified external State Data Set', async () => {
        const state = await models.State.findByPk('05');
        await state.importAgencies('7f666fe4-dbdd-4c7f-ab44-d9157379a680', stateDataSet);
        assert.deepStrictEqual(await models.Agency.count(), 4);
        await state.reload();
        assert.deepStrictEqual(state.status, { code: 202, message: 'Imported 4 Agencies' });
        const agency = await models.Agency.findOne({
          where: {
            stateId: '05',
            stateUniqueId: '072',
          },
        });
        assert.deepStrictEqual(agency.nemsisVersion, '3.5.0.211008CP3');
        assert.deepStrictEqual(agency.stateDataSetId, stateDataSet.id);
      });

      it('imports Facility records from the specified external State Data Set', async () => {
        const state = await models.State.findByPk('05');
        await state.importFacilities('7f666fe4-dbdd-4c7f-ab44-d9157379a680', stateDataSet);
        assert.deepStrictEqual(await models.Facility.count(), 4);
        await state.reload();
        assert.deepStrictEqual(state.status, { code: 202, message: 'Imported 4 Facilities' });
        const facility = await models.Facility.findOne({
          where: {
            stateId: '05',
            locationCode: '1417199225',
          },
        });
        assert(facility);
      });
    });
  });
});
