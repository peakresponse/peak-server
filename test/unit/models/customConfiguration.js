const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('CustomConfiguration', () => {
    let user;
    let agency;
    beforeEach(async () => {
      await helpers.loadFixtures([
        'users',
        'states',
        'counties',
        'cities',
        'psaps',
        'nemsisStateDataSets',
        'nemsisSchematrons',
        'agencies',
        'versions',
      ]);
      user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
      agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
    });

    describe('.save()', () => {
      it('populates columns from the data', async () => {
        const record = models.CustomConfiguration.build();
        record.createdByAgencyId = agency.id;
        record.createdById = user.id;
        record.updatedById = user.id;
        record.versionId = agency.versionId;
        record.data = {
          _attributes: { CustomElementID: 'dAgency.11' },
          'dCustomConfiguration.01': { _attributes: { nemsisElement: 'dAgency.11' }, _text: 'dAgency.11' },
          'dCustomConfiguration.02': {
            _text:
              'The level of service which the agency provides EMS care for every request for service (the minimum certification level). This may be the license level granted by the state EMS office.',
          },
          'dCustomConfiguration.03': { _text: '9902009' },
          'dCustomConfiguration.04': { _text: '9923001' },
          'dCustomConfiguration.05': { _text: '9903001' },
          'dCustomConfiguration.06': [
            {
              _attributes: {
                customValueDescription: 'First Responder',
                nemsisCode: '9917003',
              },
              _text: 'it9917.186',
            },
            {
              _attributes: {
                customValueDescription: 'Nurse',
                nemsisCode: '9917031',
              },
              _text: 'it9917.189',
            },
          ],
        };
        await record.save();
        assert.strictEqual(record.customElementId, 'dAgency.11');
        assert.strictEqual(record.dataSet, 'DEMDataSet');
      });

      it('validates its data against NEMSIS xsd', async () => {
        const record = models.CustomConfiguration.build();
        record.createdByAgencyId = agency.id;
        record.createdById = user.id;
        record.updatedById = user.id;
        record.versionId = agency.versionId;
        record.data = {
          _attributes: { CustomElementID: 'dAgency.11' },
          'dCustomConfiguration.01': { _attributes: { nemsisElement: 'dAgency.11' }, _text: 'dAgency.11' },
          'dCustomConfiguration.02': { _text: '' },
          'dCustomConfiguration.03': { _text: '9902000' },
          'dCustomConfiguration.04': { _text: '9923001' },
          'dCustomConfiguration.05': { _text: '9903001' },
        };
        await record.save();
        assert(!record.isValid);
        assert.deepStrictEqual(record.validationErrors, {
          name: 'SchemaValidationError',
          errors: [
            {
              path: `$['dCustomConfiguration.CustomGroup']['dCustomConfiguration.02']`,
              message: 'This field is required.',
              value: null,
            },
            {
              path: `$['dCustomConfiguration.CustomGroup']['dCustomConfiguration.03']`,
              message: 'This is not a valid value.',
              value: '9902000',
            },
          ],
        });
      });
    });
  });
});
