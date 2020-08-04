'use strict'

const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');

describe('/api/patients', function() {
  let testSession;

  beforeEach(async function() {
    await helpers.loadFixtures(['states', 'agencies', 'facilities', 'users', 'patients', 'observations']);
    testSession = session(app);
    await testSession.post('/login')
      .send({email: 'admin@peakresponse.net', password: 'abcd1234'})
      .expect(200)
  });

  describe('GET /', function() {
    it('returns a list of patients', async function() {
      const response = await testSession.get('/api/patients')
        .expect(200);
      assert.equal(response.body.length, 7);
    });

    it('includes dependent objects when first encountered, references after', async function() {
      /// setup- assign diff assign different agency and facility records
      let response = await testSession.get('/api/patients')
        .expect(200);
      let i = 0;
      for (let data of response.body) {
        const patient = await models.Patient.findByPk(data.id);
        if (i < 4) {
          patient.transportAgencyId = 'e705f64b-1399-436e-a428-18c8378b3444';
          patient.transportFacilityId = '7d47a57b-f20b-4c09-83ab-2972ac7ad431';
        } else {
          patient.transportAgencyId = '5de082f2-3242-43be-bc2b-6e9396815b4f';
          patient.transportFacilityId = 'fbb448ba-eb2b-4070-97d6-4ab6f13263ad';
        }
        await patient.save();
        i += 1;
      }
      /// now, re-fetch and assert
      response = await testSession.get('/api/patients')
        .expect(200);
      i = 0;
      for (let data of response.body) {
        if (i < 4) {
          if (i == 0) {
            /// we should have a full serialized object for the first record
            assert(data.transportAgency);
            assert.equal(data.transportAgency.id, 'e705f64b-1399-436e-a428-18c8378b3444');
            assert(data.transportFacility);
            assert.equal(data.transportFacility.id, '7d47a57b-f20b-4c09-83ab-2972ac7ad431');
          } else {
            /// the rest should just have id
            assert(!data.transportAgency);
            assert.equal(data.transportAgencyId, 'e705f64b-1399-436e-a428-18c8378b3444');
            assert(!data.transportFacility);
            assert.equal(data.transportFacilityId, '7d47a57b-f20b-4c09-83ab-2972ac7ad431');
          }
        } else {
          if (i == 4) {
            /// we should have a full serialized object for the first record
            assert(data.transportAgency);
            assert.equal(data.transportAgency.id, '5de082f2-3242-43be-bc2b-6e9396815b4f');
            assert(data.transportFacility);
            assert.equal(data.transportFacility.id, 'fbb448ba-eb2b-4070-97d6-4ab6f13263ad');
          } else {
            /// the rest should just have id
            assert(!data.transportAgency);
            assert.equal(data.transportAgencyId, '5de082f2-3242-43be-bc2b-6e9396815b4f');
            assert(!data.transportFacility);
            assert.equal(data.transportFacilityId, 'fbb448ba-eb2b-4070-97d6-4ab6f13263ad');
          }
        }
        i += 1;
      }
    });
  });
});
