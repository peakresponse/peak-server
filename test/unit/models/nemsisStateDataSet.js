const assert = require('assert');

const helpers = require('../../helpers');

const models = require('../../../models');
const nemsisStates = require('../../../lib/nemsis/states');

describe('models', () => {
  describe('NemsisStateDataSet', () => {
    context('repositories', () => {
      let repo;
      before(async () => {
        repo = nemsisStates.getNemsisStateRepo('50', '3.5.0');
        await repo.pull();
        await repo.install('2023-04-11-9574129ba2069ced561b85b18ad04d9f18855576');
      });

      beforeEach(async () => {
        await helpers.loadFixtures(['cities', 'counties', 'states', 'users', 'nemsisStateDataSets', 'nemsisSchematrons']);
      });

      describe('.importAgencies()', () => {
        it('imports Agency records from the specified NEMSIS State Data Set version', async () => {
          const stateDataSet = await models.NemsisStateDataSet.findByPk('1301f4e2-87b9-486a-b3d0-61a46d703b44');
          await stateDataSet.importAgencies('7f666fe4-dbdd-4c7f-ab44-d9157379a680');
          assert.deepStrictEqual(await models.Agency.count(), 163);
          await stateDataSet.reload();
          assert.deepStrictEqual(stateDataSet.status, { code: 202, message: 'Imported 163 Agencies' });
        });
      });

      describe('.importFacilities()', () => {
        it('imports Facility records from the specified NEMSIS State Data Set version', async () => {
          const stateDataSet = await models.NemsisStateDataSet.findByPk('1301f4e2-87b9-486a-b3d0-61a46d703b44');
          await stateDataSet.importFacilities('7f666fe4-dbdd-4c7f-ab44-d9157379a680');
          assert.deepStrictEqual(await models.Facility.count(), 390);
          await stateDataSet.reload();
          assert.deepStrictEqual(stateDataSet.status, { code: 202, message: 'Imported 390 Facilities' });
        });
      });
    });

    context('external state data set file', () => {
      let file;
      let stateDataSet;

      beforeEach(async () => {
        await helpers.loadFixtures(['cities', 'counties', 'states', 'users', 'nemsisStateDataSets', 'nemsisSchematrons']);
        file = await helpers.uploadFile('2023-STATE-1_v350.xml');
        stateDataSet = await models.NemsisStateDataSet.create({
          stateId: '05',
          nemsisVersion: '3.5.0.211008CP3',
          file,
          fileName: '2023-STATE-1_v350.xml',
          createdById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          updatedById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
        });
      });

      afterEach(async () => {
        await helpers.cleanUploadedAssets();
      });

      it('imports Agency records from the specified external State Data Set', async () => {
        await stateDataSet.importAgencies('7f666fe4-dbdd-4c7f-ab44-d9157379a680');
        assert.deepStrictEqual(await models.Agency.count(), 4);
        await stateDataSet.reload();
        assert.deepStrictEqual(stateDataSet.status, { code: 202, message: 'Imported 4 Agencies' });
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
        await stateDataSet.importFacilities('7f666fe4-dbdd-4c7f-ab44-d9157379a680');
        assert.deepStrictEqual(await models.Facility.count(), 4);
        await stateDataSet.reload();
        assert.deepStrictEqual(stateDataSet.status, { code: 202, message: 'Imported 4 Facilities' });
        const facility = await models.Facility.findOne({
          where: {
            stateId: '48',
            locationCode: '1295736734',
          },
        });
        assert(facility);
        // make sure attributes on elements were imported
        assert.deepStrictEqual(facility.data?.['sFacility.FacilityGroup']?.['sFacility.15']?.[0]?._attributes?.PhoneNumberType, '9913009');
        assert.deepStrictEqual(facility.data?.['sFacility.FacilityGroup']?.['sFacility.15']?.[1]?._attributes?.PhoneNumberType, '9913009');
      });
    });
  });
});
