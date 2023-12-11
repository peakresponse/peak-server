const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Patient', () => {
    let user;
    let agency;

    beforeEach(async () => {
      await helpers.loadFixtures([
        'users',
        'cities',
        'states',
        'counties',
        'psaps',
        'nemsisStateDataSets',
        'nemsisSchematrons',
        'agencies',
        'versions',
        'vehicles',
        'contacts',
        'employments',
        'scenes',
        'responders',
        'patients',
      ]);
      user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
      agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
    });

    describe('.data', () => {
      it('is synchronized with attributes on validation', async () => {
        const patient = await models.Patient.findByPk('47449282-c48a-4ca1-a719-5117b790fc70');
        assert.deepStrictEqual(patient.data, {
          'ePatient.07': {
            _attributes: {
              'xsi:nil': 'true',
              NV: '7701003',
            },
          },
          'ePatient.08': {
            _attributes: {
              'xsi:nil': 'true',
              NV: '7701003',
            },
          },
          'ePatient.09': {
            _attributes: {
              'xsi:nil': 'true',
              NV: '7701003',
            },
          },
          'ePatient.13': {
            _attributes: {
              'xsi:nil': 'true',
              NV: '7701003',
            },
          },
          'ePatient.14': {
            _attributes: {
              'xsi:nil': 'true',
              NV: '7701003',
            },
          },
          'ePatient.AgeGroup': {
            'ePatient.15': {
              _text: 18,
            },
            'ePatient.16': {
              _attributes: {
                'xsi:nil': 'true',
                NV: '7701003',
              },
            },
          },
          'ePatient.PatientNameGroup': {
            'ePatient.02': {
              _text: 'Jones',
            },
            'ePatient.03': {
              _text: 'David',
            },
          },
        });

        patient.gender = '9906001';
        await patient.validate();
        assert.deepStrictEqual(patient.data['ePatient.13'], {
          _text: '9906001',
        });

        patient.gender = null;
        await patient.validate();
        assert.deepStrictEqual(patient.data['ePatient.13'], {
          _attributes: {
            'xsi:nil': 'true',
            NV: '7701003',
          },
        });
      });
    });

    describe('createOrUpdate()', () => {
      let portraitFile;
      beforeEach(() => {
        portraitFile = helpers.uploadFile('512x512.png');
      });

      afterEach(() => {
        helpers.cleanUploadedAssets();
      });

      it('creates a new Patient record', async () => {
        const id = uuidv4();
        const [patient, created] = await models.Patient.createOrUpdate(user, agency, {
          id,
          canonicalId: uuidv4(),
          pin: '123456',
          firstName: 'John',
          lastName: 'Doe',
          priority: 2,
          portraitFile,
        });
        assert(patient);
        assert(created);
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
          'pin',
          'lastName',
          'firstName',
          'priority',
          'portraitFile',
        ]);
        assert.deepStrictEqual(patient.data, {
          'ePatient.07': {
            _attributes: {
              NV: '7701003',
              'xsi:nil': 'true',
            },
          },
          'ePatient.08': {
            _attributes: {
              NV: '7701003',
              'xsi:nil': 'true',
            },
          },
          'ePatient.09': {
            _attributes: {
              NV: '7701003',
              'xsi:nil': 'true',
            },
          },
          'ePatient.13': {
            _attributes: {
              NV: '7701003',
              'xsi:nil': 'true',
            },
          },
          'ePatient.14': {
            _attributes: {
              NV: '7701003',
              'xsi:nil': 'true',
            },
          },
          'ePatient.AgeGroup': {
            'ePatient.15': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
            'ePatient.16': {
              _attributes: {
                NV: '7701003',
                'xsi:nil': 'true',
              },
            },
          },
          'ePatient.PatientNameGroup': {
            'ePatient.02': { _text: 'Doe' },
            'ePatient.03': { _text: 'John' },
          },
        });

        const canonical = await patient.getCanonical();
        assert.deepStrictEqual(canonical.currentId, patient.id);
        assert.deepStrictEqual((await canonical.getVersions()).length, 1);

        assert.deepStrictEqual(canonical.firstName, 'John');
        assert.deepStrictEqual(canonical.lastName, 'Doe');
        assert.deepStrictEqual(canonical.priority, 2);
        assert.deepStrictEqual(canonical.portraitFile, portraitFile);
        assert.deepStrictEqual(canonical.portraitUrl, `/api/assets/patients/${patient.id}/portrait-file/${portraitFile}`);
      });

      it('updates the Patient with a new historical record', async () => {
        const patient = await models.Patient.findByPk('47449282-c48a-4ca1-a719-5117b790fc70');
        assert.deepStrictEqual(patient.priority, 0);
        assert.deepStrictEqual(patient.portraitUrl, `/api/assets/patients/cb94a8a4-bf8b-4316-8a3f-191aa2df4633/portrait-file/man1.jpg`);

        const id = uuidv4();
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
        assert.deepStrictEqual(patient.currentId, record.id);
        assert.deepStrictEqual(patient.firstName, 'New');
        assert.deepStrictEqual(patient.lastName, 'Name');
        assert.deepStrictEqual(patient.priority, 2);
        assert.deepStrictEqual(patient.portraitUrl, `/api/assets/patients/${record.id}/portrait-file/man1.jpg`);
      });
    });
  });
});
