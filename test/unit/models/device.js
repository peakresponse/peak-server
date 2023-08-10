const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Device', () => {
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
        const record = models.Device.build();
        record.createdByAgencyId = agency.id;
        record.createdById = user.id;
        record.updatedById = user.id;
        record.versionId = agency.versionId;
        record.data = {
          _attributes: {
            UUID: '3311c71c-6425-44e0-b65e-7b2a91775704',
          },
          'dDevice.01': {
            _text: '5y44595',
          },
          'dDevice.02': {
            _text: 'MON01',
          },
          'dDevice.03': [
            {
              _text: '1603015',
            },
            {
              _text: '1603017',
            },
          ],
          'dDevice.04': {
            _text: '12 Lead Inc.',
          },
          'dDevice.05': {
            _text: 'LeadFib v2',
          },
          'dDevice.06': {
            _text: '2018-05-26',
          },
        };
        await record.save();
        assert.strictEqual(record.id, '3311c71c-6425-44e0-b65e-7b2a91775704');
        assert.strictEqual(record.serialNumber, '5y44595');
        assert.strictEqual(record.name, 'MON01');
        assert.strictEqual(record.primaryType, '1603015');
      });

      it('validates its data against NEMSIS xsd', async () => {
        const record = models.Device.build();
        record.createdByAgencyId = agency.id;
        record.createdById = user.id;
        record.updatedById = user.id;
        record.versionId = agency.versionId;
        record.data = {
          _attributes: {
            UUID: '3311c71c-6425-44e0-b65e-7b2a91775704',
          },
          'dDevice.01': {
            _text: '5y44595',
          },
          'dDevice.02': {
            _text: 'MON01',
          },
          'dDevice.03': [
            {
              _text: '1603000',
            },
          ],
          'dDevice.04': {
            _text: '12 Lead Inc.',
          },
          'dDevice.05': {
            _text: 'LeadFib v2',
          },
          'dDevice.06': {
            _text: '1800-05-26',
          },
        };
        await record.save();
        assert(!record.isValid);
        assert.deepStrictEqual(record.validationErrors, {
          name: 'SchemaValidationError',
          errors: [
            {
              message: 'This is not a valid value.',
              path: "$['dDevice.DeviceGroup']['dDevice.03'][0]",
              value: '1603000',
            },
            {
              path: "$['dDevice.DeviceGroup']['dDevice.06']",
              message: 'This is not a valid value.',
              value: '1800-05-26',
            },
          ],
        });
      });
    });
  });
});
