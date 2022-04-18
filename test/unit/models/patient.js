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
      await helpers.loadFixtures(['users', 'states', 'agencies', 'contacts', 'employments', 'scenes', 'responders', 'patients']);
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
        fs.removeSync(path.resolve(__dirname, `../../../public/assets/test`));
      });

      it('creates a new Patient and adds it to the specified scene', async () => {
        assert.deepStrictEqual(scene.patientsCount, 7);
        assert.deepStrictEqual(scene.priorityPatientsCounts, [5, 1, 0, 0, 1, 0]);

        const id = uuid();
        const [patient, created] = await models.Patient.createOrUpdate(user, agency, {
          id,
          sceneId: scene.id,
          pin: '123456',
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
        assert.deepStrictEqual(patient.portraitFile, portraitFile);
        assert.deepStrictEqual(patient.portraitUrl, `/api/assets/patients/${patient.id}/portrait-file/${portraitFile}`);
        assert(
          fs.pathExistsSync(path.resolve(__dirname, `../../../public/assets/test/patients/${patient.id}/portrait-file`, portraitFile))
        );
        assert.deepStrictEqual(patient.updatedAttributes, [
          'id',
          'canonicalId',
          'sceneId',
          'pin',
          'lastName',
          'firstName',
          'priority',
          'portraitFile',
        ]);
        assert.deepStrictEqual(patient.data, {
          _attributes: { UUID: patient.id },
          'ePatient.PatientNameGroup': {
            'ePatient.02': { _text: 'Doe' },
            'ePatient.03': { _text: 'John' },
          },
        });

        const canonical = await patient.getCanonical();
        assert.deepStrictEqual(canonical.currentId, patient.id);
        assert.deepStrictEqual((await canonical.getVersions()).length, 1);

        assert.deepStrictEqual(canonical.sceneId, scene.id);
        assert.deepStrictEqual(canonical.firstName, 'John');
        assert.deepStrictEqual(canonical.lastName, 'Doe');
        assert.deepStrictEqual(canonical.priority, 2);
        assert.deepStrictEqual(canonical.portraitFile, portraitFile);
        assert.deepStrictEqual(canonical.portraitUrl, `/api/assets/patients/${patient.id}/portrait-file/${portraitFile}`);

        await scene.reload();
        assert.deepStrictEqual(scene.patientsCount, 8);
        assert.deepStrictEqual(scene.priorityPatientsCounts, [5, 1, 1, 0, 1, 0]);
      });

      it('updates the Patient with a new historical record', async () => {
        assert.deepStrictEqual(scene.priorityPatientsCounts, [5, 1, 0, 0, 1, 0]);

        const patient = await models.Patient.findByPk('47449282-c48a-4ca1-a719-5117b790fc70');
        assert.deepStrictEqual(patient.priority, 0);
        assert.deepStrictEqual(patient.portraitUrl, `/api/assets/patients/${patient.id}/portrait-file/man1.jpg`);

        const id = uuid();
        const [record, created] = await models.Patient.createOrUpdate(user, agency, {
          id,
          parentId: 'cb94a8a4-bf8b-4316-8a3f-191aa2df4633',
          firstName: 'New',
          lastName: 'Name',
          priority: 2,
        });
        assert(record);
        assert(!created);
        assert.deepStrictEqual(record.canonicalId, patient.id);
        assert.deepStrictEqual(record.parentId, 'cb94a8a4-bf8b-4316-8a3f-191aa2df4633');
        assert.deepStrictEqual(record.firstName, 'New');
        assert.deepStrictEqual(record.lastName, 'Name');
        assert.deepStrictEqual(record.priority, 2);
        assert.deepStrictEqual(record.portraitUrl, `/api/assets/patients/${record.id}/portrait-file/man1.jpg`);
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'parentId', 'lastName', 'firstName', 'priority']);

        await patient.reload();
        assert.deepStrictEqual(patient.firstName, 'New');
        assert.deepStrictEqual(patient.lastName, 'Name');
        assert.deepStrictEqual(patient.priority, 2);
        assert.deepStrictEqual(patient.portraitUrl, `/api/assets/patients/${record.id}/portrait-file/man1.jpg`);

        await scene.reload();
        assert.deepStrictEqual(scene.priorityPatientsCounts, [4, 1, 1, 0, 1, 0]);
      });
    });
  });
});
