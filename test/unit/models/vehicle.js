const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Vehicle', () => {
    let user;
    let agency;

    beforeEach(async () => {
      await helpers.loadFixtures(['users', 'states', 'agencies', 'employments', 'vehicles']);
      user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
      agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
    });

    describe('.save()', () => {
      it('populates attributes from Nemsis data', async () => {
        const record = models.Vehicle.build();
        record.createdByAgencyId = agency.id;
        record.createdById = user.id;
        record.updatedById = user.id;
        record.data = {
          _attributes: {
            UUID: '5c0a380c-0f69-4533-bf6b-5238a2f02d10',
          },
          'dVehicle.01': {
            _text: 'RC1',
          },
          'dVehicle.02': {
            _text: '5XYKU4A12BG001739',
          },
          'dVehicle.03': {
            _text: 'RC1',
          },
          'dVehicle.04': {
            _text: '1404019',
          },
        };
        await record.save();

        assert.deepStrictEqual(record.id, '5c0a380c-0f69-4533-bf6b-5238a2f02d10');
        assert.deepStrictEqual(record.number, 'RC1');
        assert.deepStrictEqual(record.vin, '5XYKU4A12BG001739');
        assert.deepStrictEqual(record.callSign, 'RC1');
        assert.deepStrictEqual(record.type, '1404019');
      });
    });

    describe('.data', () => {
      it('is populated by attribute setters', async () => {
        const record = await models.Vehicle.findByPk('4d71fd4a-ef2b-4a0c-aa11-214b5f54f8f7');
        record.number = '99';
        record.vin = '5NPDH4AE0DH213924';
        record.callSign = '99';
        record.type = '1404019';
        await record.save();

        assert.deepStrictEqual(record.data, {
          _attributes: {
            UUID: '4d71fd4a-ef2b-4a0c-aa11-214b5f54f8f7',
            'pr:isValid': true,
          },
          'dVehicle.01': {
            _text: '99',
          },
          'dVehicle.02': {
            _text: '5NPDH4AE0DH213924',
          },
          'dVehicle.03': {
            _text: '99',
          },
          'dVehicle.04': {
            _text: '1404019',
          },
        });
      });
    });
  });
});
