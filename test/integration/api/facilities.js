const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');
const { mockRouted } = require('../../mocks/routed');

describe('/api/facilities', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'states',
      'counties',
      'cities',
      'users',
      'psaps',
      'dispatchers',
      'nemsisStateDataSets',
      'nemsisSchematrons',
      'regions',
      'agencies',
      'versions',
      'employments',
      'venues',
      'facilities',
    ]);
    testSession = session(app);
    await testSession.post('/login').send({ email: 'admin@peakresponse.net', password: 'abcd1234' }).expect(StatusCodes.OK);
  });

  describe('GET /', () => {
    it('returns a paginated list of Facility records', async () => {
      const response = await testSession
        .get('/api/facilities/')
        .expect(StatusCodes.OK)
        .expect('X-Total-Count', '127')
        .expect(
          'Link',
          `<${process.env.BASE_URL}/api/facilities/?page=2>; rel="next",<${process.env.BASE_URL}/api/facilities/?page=6>; rel="last"`,
        );
      assert.deepStrictEqual(response.body.length, 25);
    });

    it('returns a paginated list of Facility records with the given type', async () => {
      const response = await testSession
        .get('/api/facilities/')
        .query({ type: '1701005' })
        .expect(StatusCodes.OK)
        .expect('X-Total-Count', '16');
      assert.deepStrictEqual(response.body.length, 16);
    });

    it('returns a paginated list of Facility records near the lat/lng', async () => {
      const response = await testSession
        .get('/api/facilities/')
        .query({ lat: '37.7866029', lng: '-122.4560444' })
        .expect(StatusCodes.OK)
        .expect('X-Total-Count', '128')
        .expect(
          'Link',
          `<${process.env.BASE_URL}/api/facilities/?lat=37.7866029&lng=-122.4560444&page=2>; rel="next",<${process.env.BASE_URL}/api/facilities/?lat=37.7866029&lng=-122.4560444&page=6>; rel="last"`,
        );
      assert.deepStrictEqual(response.body.length, 25);
      assert.deepStrictEqual(response.body[0].name, 'CPMC - 3801 Sacramento Street');
    });

    it('returns a paginated list of search filtered Facility records near the lat/lng', async () => {
      const response = await testSession
        .get('/api/facilities/')
        .query({ lat: '37.7866029', lng: '-122.4560444' })
        .query({ search: 'cpmc' })
        .expect(StatusCodes.OK)
        .expect('X-Total-Count', '8')
        .expect('Link', '');
      assert.deepStrictEqual(response.body.length, 8);
      assert.deepStrictEqual(response.body[0].name, 'CPMC - 3801 Sacramento Street');
      for (const facility of response.body) {
        assert(facility.name.match(/cpmc/i));
      }
    });

    it('returns a paginated list of Facility records for a Venue', async () => {
      const response = await testSession
        .get('/api/facilities/')
        .query({ venueId: 'c99fba71-91bf-4a1a-80f8-89123c324687' })
        .expect(StatusCodes.OK)
        .expect('X-Total-Count', '1');
      assert.deepStrictEqual(response.body.length, 1);
      assert.deepStrictEqual(response.body[0].name, 'First Aid 1');
    });
  });

  describe('POST /', () => {
    it('allows an Agency user to create a new Facility record for a Venue', async () => {
      mockRouted();
      await testSession
        .post('/login')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
        .expect(StatusCodes.OK);
      const response = await testSession
        .post('/api/facilities')
        .set('Accept', 'application/json')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          venueId: 'c99fba71-91bf-4a1a-80f8-89123c324687',
          name: 'First Aid 2',
        })
        .expect(StatusCodes.CREATED);

      const record = await models.Facility.findByPk(response.body.id);
      assert.deepStrictEqual(record.name, 'First Aid 2');
      assert.deepStrictEqual(record.venueId, 'c99fba71-91bf-4a1a-80f8-89123c324687');
      assert.deepStrictEqual(record.createdByAgencyId, '9eeb6591-12f8-4036-8af8-6b235153d444');
    });

    it('allows an Admin to create a new canonical Facility record', async () => {
      mockRouted();
      const response = await testSession
        .post('/api/facilities')
        .set('Accept', 'application/json')
        .send({
          name: 'Medical Center Hospital',
          address: '100 Medical Center Drive',
          cityId: '1384879',
          stateId: '48',
          countyId: '48453',
          zip: '78731',
        })
        .expect(StatusCodes.CREATED);
      const { id } = response.body;
      assert.ok(id);
      const record = await models.Facility.findByPk(id);
      assert.deepStrictEqual(record.data, {
        'sFacility.FacilityGroup': {
          'sFacility.02': {
            _text: 'Medical Center Hospital',
          },
          'sFacility.07': {
            _text: '100 Medical Center Drive',
          },
          'sFacility.08': {
            _text: '1384879',
          },
          'sFacility.09': {
            _text: '48',
          },
          'sFacility.10': {
            _text: '78731',
          },
          'sFacility.11': {
            _text: '48453',
          },
        },
      });
    });
  });

  describe('POST /fetch', () => {
    it('returns a list of matching Facilities', async () => {
      const response = await testSession
        .post('/api/facilities/fetch')
        .set('Accept', 'application/json')
        .send({
          '06': ['20386', '62636'],
        })
        .expect(StatusCodes.OK);
      const facilities = response.body;
      facilities.sort((a, b) => a.name.localeCompare(b.name));
      assert.deepStrictEqual(facilities.length, 2);
      assert.deepStrictEqual(facilities[0].name, 'CPMC-Van Ness');
      assert.deepStrictEqual(facilities[1].name, 'Zuckerberg San Francisco General Hospital and Trauma Center');
    });
  });

  describe('PATCH /:id', () => {
    it('allows an Agency user to update a Facility record for a Venue', async () => {
      mockRouted();
      await testSession
        .post('/login')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
        .expect(StatusCodes.OK);

      await testSession
        .patch('/api/facilities/79ac2493-ab6a-4fa7-a04a-bde4b7a9f341')
        .set('Accept', 'application/json')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          name: 'FA 1',
        })
        .expect(StatusCodes.OK);

      const record = await models.Facility.findByPk('79ac2493-ab6a-4fa7-a04a-bde4b7a9f341');
      assert.deepStrictEqual(record.name, 'FA 1');
    });

    it('allows an Admin to update a canonical Facility record', async () => {
      mockRouted();
      await testSession
        .patch('/api/facilities/23a7e241-4486-40fb-babb-aaa4c060c659')
        .set('Accept', 'application/json')
        .send({
          name: 'Adante Hotel',
        })
        .expect(StatusCodes.OK);
      const record = await models.Facility.findByPk('23a7e241-4486-40fb-babb-aaa4c060c659');
      assert.deepStrictEqual(record.name, 'Adante Hotel');
      assert.deepStrictEqual(record.data, {
        'sFacility.FacilityGroup': {
          'sFacility.02': {
            _text: 'Adante Hotel',
          },
          'sFacility.03': {
            _text: '64962',
          },
          'sFacility.07': {
            _text: '610 Geary St',
          },
          'sFacility.08': {
            _text: '2411786',
          },
          'sFacility.09': {
            _text: '06',
          },
          'sFacility.10': {
            _text: '94102',
          },
          'sFacility.11': {
            _text: '06075',
          },
          'sFacility.12': {
            _text: 'US',
          },
          'sFacility.13': {
            _text: '37.786949,-122.4136599',
          },
        },
      });
    });
  });
});
