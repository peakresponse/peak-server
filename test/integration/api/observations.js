'use strict'

const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');

describe('/api/observations', function() {
  let testSession;

  beforeEach(async function() {
    await helpers.loadFixtures(['states', 'agencies', 'facilities', 'users']);
    testSession = session(app);
    await testSession.post('/login')
      .send({email: 'admin@peakresponse.net', password: 'abcd1234'})
      .expect(200)
  });

  describe('POST /', function() {
    it('creates a new Patient record with the first Observation', async function() {
      const response = await testSession.post('/api/observations/')
        .send({
          pin: '123456',
          priority: 2,
          firstName: 'Jane',
          lastName: 'Doe',
          age: 23,
        })
        .expect(HttpStatus.CREATED);
      const observation = await models.Observation.findByPk(response.body.id);
      assert(observation);
      assert.deepStrictEqual(observation.updatedAttributes, ['priority', 'firstName', 'lastName', 'age']);
      assert.equal(observation.priority, 2);
      assert.equal(observation.firstName, 'Jane');
      assert.equal(observation.lastName, 'Doe');
      assert.equal(observation.age, 23);

      const patient = await models.Patient.findByPk(observation.patientId);
      assert(patient);
      assert.equal(patient.version, 1);
      assert.equal(patient.pin, 123456);
      assert.equal(patient.priority, 2);
      assert.equal(patient.firstName, 'Jane');
      assert.equal(patient.lastName, 'Doe');
      assert.equal(patient.age, 23);
    });

    it('updates a Patient record with a new version with an additional Observation', async function() {
      await testSession.post('/api/observations/')
        .send({
          pin: '123456',
          priority: 2,
          firstName: 'Jane',
          lastName: 'Doe',
          age: 23,
        })
        .expect(HttpStatus.CREATED);
      const response = await testSession.post('/api/observations/')
        .send({
          pin: '123456',
          transportAgencyId: 'e705f64b-1399-436e-a428-18c8378b3444',
          transportFacilityId: '28cfd588-2c32-4e92-ad19-e35df933c64a'
        })
        .expect(HttpStatus.CREATED);
      const observation = await models.Observation.findByPk(response.body.id);
      assert(observation);
      assert.deepStrictEqual(observation.updatedAttributes, ['transportAgencyId', 'transportFacilityId']);
      assert.equal(observation.transportAgencyId, 'e705f64b-1399-436e-a428-18c8378b3444');
      assert.equal(observation.transportFacilityId, '28cfd588-2c32-4e92-ad19-e35df933c64a');

      let agency = await observation.getTransportAgency();
      let facility = await observation.getTransportFacility();
      assert.equal(agency.name, 'Bay Medic Ambulance - Alameda');
      assert.equal(facility.name, 'CPMC - 3801 Sacramento Street');

      const patient = await models.Patient.findByPk(observation.patientId);
      assert(patient);
      assert.equal(patient.version, 2);
      assert.equal(patient.transportAgencyId, 'e705f64b-1399-436e-a428-18c8378b3444');
      assert.equal(patient.transportFacilityId, '28cfd588-2c32-4e92-ad19-e35df933c64a');

      agency = await patient.getTransportAgency();
      facility = await patient.getTransportFacility();
      assert.equal(agency.name, 'Bay Medic Ambulance - Alameda');
      assert.equal(facility.name, 'CPMC - 3801 Sacramento Street');
    });
  });
});
