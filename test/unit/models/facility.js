const assert = require('assert');
const nock = require('nock');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Facility', () => {
    describe('findNear()', () => {
      beforeEach(async () => {
        await helpers.loadFixtures(['cities', 'counties', 'states', 'users', 'facilities']);
      });

      it('should return a paginated list of facilities near the specified point', async () => {
        const { docs, total } = await models.Facility.findNear('37.7866029', '-122.4560444');
        assert.deepStrictEqual(total, 127);
        assert.deepStrictEqual(docs[0].name, 'CPMC - 3801 Sacramento Street'); /// this is the exact match to the coordinates above
      });

      it('should support additional query conditions', async () => {
        const { docs, total } = await models.Facility.findNear('37.7866029', '-122.4560444', {
          where: {
            name: { [models.Sequelize.Op.iLike]: '%cpmc%' },
          },
        });
        assert(total, 7);
        assert.deepStrictEqual(docs[0].name, 'CPMC - 3801 Sacramento Street');
        for (const facility of docs) {
          assert(facility.name.match(/cpmc/i));
        }
      });
    });

    describe('geog', () => {
      it('should be set automatically when assigning to lat/lng', async () => {
        const facility = await models.Facility.create({
          lat: '37.7873437',
          lng: '-122.4536086',
        });
        assert(facility.geog);
      });
    });

    describe('geocode()', () => {
      it('should geocode address into lat/lng', async () => {
        nock('https://maps.googleapis.com:443', { encodedQueryParams: true })
          .get('/maps/api/geocode/json')
          .query({
            address: '3698%20Sacramento%20Street%2C%20City%20of%20San%20Francisco%2C%20California',
            key: process.env.GOOGLE_MAPS_SERVER_API_KEY,
          })
          .reply(
            200,
            '1f8b08000000000002ffb5955b739a4014c7dff3297678b619b943dfbca03117735193b19d0cb3c21636c22e038b8966fcee5dd05a11536863791139ffb3fcce7fcf1edecf0000428c9234608900be82efd9037ebd6f7fb330745dae486c8786112588149525fd362ba0c4b3090c51261664cd3484464994f83466952ab68cd0e69d3c83c508f194349ca15800cf05f1baf1575023e8c4fc9e300a46f9b2d58485940ad498a60c7d12f18e3b8f5d4cc105c29ecf9daf24ac91b10f4932d58cc63ea5aed000424403ccb003834f7b4b402f86c4c189436bf8daabe00c2867c26cf9df184187a6245bbfba056a65edc34337c404f3d6850c2f900d6304ed002d50604ba7aca7c31dfa4163826175159dd63f338ba7649e10cc90cb0f1364a846774f4615d84eb61ff149dbc45444b1c6f0fa48b64f17d184c1804f52b73c187eff7bde5b44e01b1a42c63db2b7737837294161183540a1311ba0d3023952034c4685cd163c44439499c4572a169f1f3386292987f228645940d6cf75439715592f571b102f937c1125e95c5165ad69687ff27ef7423bb3292feda135ec5bf66038b61eee6eaf5b63ab7b60aab0c0e835e2de1f87243ce223981c0f1f966168a6a4194dc914d55231e57a24493535d1d49b867a285e1f6910fe01f05f514d12d534157db3760d12c5547575c35d22f9a8aff6118528800eb2b19b7b6ebdb456c397b932e80dfda97ce9cf9e1e53b76f7813f93ec99ecd70bbef84bd742a05aba96424036bd81e74e7cd9bb1a55c77da8f93a685fb6f836f1dfffecaf2e62b5bbcd46fa6a8e7b5fb547a5a4d5786113aedeef2a2d888473eecbb26ff753a72fecd89e01ac8d2cd01b8bd12ced6673f01dc307e38c0080000',
            ['Content-Type', 'application/json; charset=UTF-8', 'Content-Encoding', 'gzip'],
          );

        await helpers.loadFixtures(['cities', 'states']);
        const facility = await models.Facility.create({
          data: {
            'sFacility.FacilityGroup': {
              'sFacility.07': { _text: '3698 Sacramento Street' },
              'sFacility.08': { _text: '2411786' },
              'sFacility.09': { _text: '06' },
            },
          },
        });

        await facility.geocode();
        assert.deepStrictEqual(facility.lat, '37.7873437');
        assert.deepStrictEqual(facility.lng, '-122.4536086');
      });
    });

    describe('save()', () => {
      beforeEach(async () => {
        await helpers.loadFixtures([
          'cities',
          'counties',
          'states',
          'users',
          'psaps',
          'nemsisStateDataSets',
          'nemsisSchematrons',
          'agencies',
          'versions',
        ]);
      });

      it('should extract from NEMSIS data into fields', async () => {
        const facility = models.Facility.build({
          data: {
            'sFacility.01': { _text: '1701003' },
            'sFacility.FacilityGroup': {
              'sFacility.02': { _text: 'Rai Care Center Laguna Canyon - Irvine' },
              'sFacility.03': { _text: '65037' },
              'sFacility.04': { _text: 'Test Designation' },
              'sFacility.05': { _text: 'Test NPI' },
              'sFacility.06': { _text: 'Test Unit' },
              'sFacility.07': { _text: '16255 Laguna Canyon Rd' },
              'sFacility.08': { _text: '1660804' },
              'sFacility.09': { _text: '06' },
              'sFacility.10': { _text: '92618' },
              'sFacility.11': { _text: '06059' },
              'sFacility.12': { _text: 'US' },
              'sFacility.13': { _text: '33.6639159,-117.7622126' },
              'sFacility.15': { _text: '213-555-1234' },
            },
          },
        });
        await facility.save();

        assert.deepStrictEqual(facility.type, '1701003');
        assert.deepStrictEqual(facility.name, 'Rai Care Center Laguna Canyon - Irvine');
        assert.deepStrictEqual(facility.locationCode, '65037');
        assert.deepStrictEqual(facility.primaryDesignation, 'Test Designation');
        assert.deepStrictEqual(facility.primaryNationalProviderId, 'Test NPI');
        assert.deepStrictEqual(facility.unit, 'Test Unit');
        assert.deepStrictEqual(facility.address, '16255 Laguna Canyon Rd');
        assert.deepStrictEqual(facility.cityId, '1660804');
        assert.deepStrictEqual(facility.cityName, 'Irvine');
        assert.deepStrictEqual(facility.stateId, '06');
        assert.deepStrictEqual(facility.zip, '92618');
        assert.deepStrictEqual(facility.countyId, '06059');
        assert.deepStrictEqual(facility.countyName, 'Orange County');
        assert.deepStrictEqual(facility.country, 'US');
        assert.deepStrictEqual(facility.geog?.coordinates, [-117.7622126, 33.6639159]);
        assert.deepStrictEqual(facility.lat, '33.6639159');
        assert.deepStrictEqual(facility.lng, '-117.7622126');
        assert.deepStrictEqual(facility.primaryPhone, '213-555-1234');
      });

      it('should validate NEMSIS data when an agency DEM record', async () => {
        const facility = await models.Facility.create({
          versionId: '645b0907-be8b-40c0-8976-a229f0a9ecd5',
          data: {
            'dFacility.01': { _text: '1701003' },
            'dFacility.FacilityGroup': {
              'dFacility.02': { _text: 'Rai Care Center Laguna Canyon - Irvine' },
              'dFacility.03': { _text: '65037' },
              'dFacility.04': { _text: '9908007' },
              'dFacility.05': { _text: '0000000000' },
              'dFacility.06': { _text: 'Test Unit' },
              'dFacility.07': { _text: '16255 Laguna Canyon Rd' },
              'dFacility.08': { _text: '1660804' },
              'dFacility.09': { _text: '06' },
              'dFacility.10': { _text: '92618' },
              'dFacility.11': { _text: '06059' },
              'dFacility.12': { _text: 'US' },
              'dFacility.13': { _text: '33.663916,-117.762213' },
              'dFacility.15': { _text: '213-555-1234' },
            },
          },
          updatedById: '7f666fe4-dbdd-4c7f-ab44-d9157379a680',
          createdById: '7f666fe4-dbdd-4c7f-ab44-d9157379a680',
          createdByAgencyId: '6bdc8680-9fa5-4ce3-86d9-7df940a7c4d8',
        });
        assert.deepStrictEqual(facility.isValid, true);
      });
    });
  });
});
