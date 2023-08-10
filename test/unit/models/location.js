const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Location', () => {
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
        const record = models.Location.build();
        record.createdByAgencyId = agency.id;
        record.createdById = user.id;
        record.updatedById = user.id;
        record.versionId = agency.versionId;
        record.data = {
          _attributes: {
            UUID: 'b01083a8-e68b-4874-9e95-02327d7cbc80',
          },
          'dLocation.01': {
            _text: '1301001',
          },
          'dLocation.02': {
            _text: 'Texarkana Texas Station',
          },
          'dLocation.03': {
            _text: 'TX1',
          },
          'dLocation.04': {
            _text: '33.447,-94.066',
          },
          'dLocation.05': {
            _text: '15SVT00920135',
          },
          'dLocation.06': {
            _attributes: {
              StreetAddress2: 'Building 2',
            },
            _text: '3223 Summerhill Road',
          },
        };
        await record.save();
        assert.strictEqual(record.id, 'b01083a8-e68b-4874-9e95-02327d7cbc80');
        assert.strictEqual(record.type, '1301001');
        assert.strictEqual(record.name, 'Texarkana Texas Station');
        assert.strictEqual(record.number, 'TX1');
      });

      it('validates its data against NEMSIS xsd', async () => {
        const record = models.Location.build();
        record.createdByAgencyId = agency.id;
        record.createdById = user.id;
        record.updatedById = user.id;
        record.versionId = agency.versionId;
        record.data = {
          _attributes: {
            UUID: 'b01083a8-e68b-4874-9e95-02327d7cbc80',
          },
          'dLocation.01': {
            _text: '1301000',
          },
          'dLocation.02': {
            _text: 'Texarkana Texas Station',
          },
          'dLocation.03': {
            _text: 'TX1',
          },
          'dLocation.04': {
            _text: '33.447,-94.066',
          },
          'dLocation.05': {
            _text: '15SVT00920135',
          },
          'dLocation.06': {
            _attributes: {
              StreetAddress2: 'Building 2',
            },
            _text: '3223 Summerhill Road',
          },
        };
        await record.save();
        assert(!record.isValid);
        assert.deepStrictEqual(record.validationErrors, {
          name: 'SchemaValidationError',
          errors: [
            {
              message: 'This is not a valid value.',
              path: "$['dLocation.LocationGroup']['dLocation.01']",
              value: '1301000',
            },
          ],
        });
      });
    });
  });
});
