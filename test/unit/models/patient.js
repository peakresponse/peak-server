const assert = require('assert');
const fs = require('fs-extra');
const mkdirp = require('mkdirp');
const path = require('path');
const uuid = require('uuid/v4');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Patient', () => {
    let user;
    let agency;
    let scene;

    beforeEach(async () => {
      await helpers.loadFixtures([
        'users',
        'states',
        'agencies',
        'contacts',
        'employments',
        'scenes',
        'sceneObservations',
        'responders',
        'patients',
      ]);
      user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
      agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
      scene = await models.Scene.findByPk('25db9094-03a5-4267-8314-bead229eff9d');
    });

    describe('createOrUpdate()', () => {
      let portraitFile;
      beforeEach(() => {
        portraitFile = `${uuid()}.png`;
        mkdirp.sync(path.resolve(__dirname, '../../../tmp/uploads'));
        fs.copySync(
          path.resolve(__dirname, '../../fixtures/files/512x512.png'),
          path.resolve(__dirname, `../../../tmp/uploads/${portraitFile}`)
        );
      });

      afterEach(() => {
        fs.removeSync(path.resolve(__dirname, `../../../tmp/uploads/${portraitFile}`));
        fs.removeSync(path.resolve(__dirname, `../../../public/assets/patient-observations/portrait/${portraitFile}`));
      });

      it('creates a new Patient and adds it to the specified scene', async () => {
        assert.deepStrictEqual(scene.patientsCount, 7);
        assert.deepStrictEqual(scene.priorityPatientsCounts, [5, 1, 0, 0, 1, 0]);

        const id = uuid();
        const [patient, created] = await models.Patient.createOrUpdate(user, agency, scene, {
          id,
          pin: '123456',
          version: 1,
          firstName: 'John',
          lastName: 'Doe',
          priority: 2,
          portraitFile,
        });
        assert(patient);
        assert(created);
        assert.deepStrictEqual(patient.sceneId, scene.id);
        assert.deepStrictEqual(patient.pin, '123456');
        assert.deepStrictEqual(patient.firstName, 'John');
        assert.deepStrictEqual(patient.lastName, 'Doe');
        assert.deepStrictEqual(patient.priority, 2);
        assert.deepStrictEqual(patient.portraitUrl, `/api/assets/patient-observations/portrait/${portraitFile}`);
        assert.deepStrictEqual(patient.version, 1);

        const observations = await patient.getObservations();
        assert.deepStrictEqual(observations.length, 1);

        const observation = observations[0];
        assert.deepStrictEqual(observation.id, id);
        assert.deepStrictEqual(observation.updatedAttributes, ['id', 'firstName', 'lastName', 'priority', 'portraitFile']);
        assert.deepStrictEqual(observation.sceneId, scene.id);
        assert.deepStrictEqual(observation.firstName, 'John');
        assert.deepStrictEqual(observation.lastName, 'Doe');
        assert.deepStrictEqual(observation.priority, 2);
        assert.deepStrictEqual(observation.portraitFile, portraitFile);
        assert.deepStrictEqual(observation.portraitUrl, `/api/assets/patient-observations/portrait/${portraitFile}`);
        assert.deepStrictEqual(observation.version, 1);
        assert(fs.pathExistsSync(path.resolve(__dirname, '../../../public/assets/patient-observations/portrait', portraitFile)));

        await scene.reload();
        assert.deepStrictEqual(scene.patientsCount, 8);
        assert.deepStrictEqual(scene.priorityPatientsCounts, [5, 1, 1, 0, 1, 0]);
      });

      it('adds an Observation and updates the Patient', async () => {
        assert.deepStrictEqual(scene.priorityPatientsCounts, [5, 1, 0, 0, 1, 0]);

        const patient = await models.Patient.findByPk('47449282-c48a-4ca1-a719-5117b790fc70');
        assert.deepStrictEqual(patient.priority, 0);
        assert.deepStrictEqual(patient.version, 2);
        assert.deepStrictEqual(patient.portraitUrl, '/api/assets/patient-observations/portrait/man1.jpg');

        const id = uuid();
        const [, created] = await models.Patient.createOrUpdate(user, agency, scene, {
          id,
          pin: '125615',
          version: 3,
          firstName: 'New',
          lastName: 'Name',
          priority: 2,
        });
        assert(!created);

        const observation = await models.PatientObservation.findByPk(id);
        assert(observation);
        assert.deepStrictEqual(observation.patientId, patient.id);
        assert.deepStrictEqual(observation.updatedAttributes, ['id', 'firstName', 'lastName', 'priority']);

        await patient.reload();
        assert.deepStrictEqual(patient.firstName, 'New');
        assert.deepStrictEqual(patient.lastName, 'Name');
        assert.deepStrictEqual(patient.priority, 2);
        assert.deepStrictEqual(patient.version, 3);
        assert.deepStrictEqual(patient.portraitUrl, '/api/assets/patient-observations/portrait/man1.jpg');

        await scene.reload();
        assert.deepStrictEqual(scene.priorityPatientsCounts, [4, 1, 1, 0, 1, 0]);
      });
    });
  });
});
