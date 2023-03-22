const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Vehicle', () => {
    let user;
    let agency;

    beforeEach(async () => {
      await helpers.loadFixtures(['users', 'states', 'counties', 'cities', 'psaps', 'agencies', 'versions', 'employments', 'vehicles']);
      user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
      agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
    });

    describe('.save()', () => {
      it('populates data from attributes', async () => {
        const record = models.Vehicle.build();
        record.isDraft = true;
        record.number = 'RC1';
        record.vin = '5XYKU4A12BG001739';
        record.callSign = 'RC1';
        record.type = '1404019';
        record.createdByAgencyId = agency.id;
        record.createdById = user.id;
        record.updatedById = user.id;
        record.versionId = agency.versionId;
        await record.save();

        await record.reload();
        assert(record.isValid);
        assert.deepStrictEqual(record.data, {
          _attributes: {
            UUID: record.id,
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
        });
      });

      it('populates attributes from NEMSIS data', async () => {
        const record = models.Vehicle.build();
        record.isDraft = true;
        record.createdByAgencyId = agency.id;
        record.createdById = user.id;
        record.updatedById = user.id;
        record.versionId = agency.versionId;
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

        await record.reload();
        assert(record.isValid);
        assert.deepStrictEqual(record.id, '5c0a380c-0f69-4533-bf6b-5238a2f02d10');
        assert.deepStrictEqual(record.number, 'RC1');
        assert.deepStrictEqual(record.vin, '5XYKU4A12BG001739');
        assert.deepStrictEqual(record.callSign, 'RC1');
        assert.deepStrictEqual(record.type, '1404019');
      });
    });

    describe('updateDraft()', () => {
      it('creates a new draft as needed', async () => {
        const parent = await models.Vehicle.findByPk('4d71fd4a-ef2b-4a0c-aa11-214b5f54f8f7');
        await parent.updateDraft({
          data: {
            _attributes: {
              UUID: '4d71fd4a-ef2b-4a0c-aa11-214b5f54f8f7',
            },
            'dVehicle.01': { _text: 'Test Number' },
            'dVehicle.02': { _text: 'JN1HS36P2LW140218' },
            'dVehicle.03': { _text: 'Test Name' },
            'dVehicle.04': { _text: '1404001' },
          },
        });
        await parent.reload();
        // parent remains unchanged
        assert.deepStrictEqual(parent.number, '88');
        assert.deepStrictEqual(parent.callSign, '88');
        assert.deepStrictEqual(parent.data, {
          _attributes: {
            UUID: '4d71fd4a-ef2b-4a0c-aa11-214b5f54f8f7',
          },
          'dVehicle.01': { _text: '88' },
          'dVehicle.02': { _text: 'JN1HS36P2LW140218' },
          'dVehicle.03': { _text: '88' },
          'dVehicle.04': { _text: '1404001' },
        });

        const draft = await parent.getDraft();
        assert(draft);
        assert(draft.isDraft);
        assert.deepStrictEqual(draft.draftParentId, '4d71fd4a-ef2b-4a0c-aa11-214b5f54f8f7');
        assert.deepStrictEqual(draft.number, 'Test Number');
        assert.deepStrictEqual(draft.callSign, 'Test Name');
        assert.deepStrictEqual(draft.data, {
          _attributes: {
            UUID: '4d71fd4a-ef2b-4a0c-aa11-214b5f54f8f7',
          },
          'dVehicle.01': { _text: 'Test Number' },
          'dVehicle.02': { _text: 'JN1HS36P2LW140218' },
          'dVehicle.03': { _text: 'Test Name' },
          'dVehicle.04': { _text: '1404001' },
        });
      });

      it('updates existing draft', async () => {
        const parent = await models.Vehicle.findByPk('91986460-5a12-426d-9855-93227b47ead5');
        await parent.updateDraft({
          number: 'Test Number',
          callSign: 'Test Name',
        });
        await parent.reload();
        // parent remains unchanged
        assert.deepStrictEqual(parent.number, '50');
        assert.deepStrictEqual(parent.callSign, '50');
        assert.deepStrictEqual(parent.data, {
          _attributes: {
            UUID: '91986460-5a12-426d-9855-93227b47ead5',
          },
          'dVehicle.01': { _text: '50' },
          'dVehicle.02': { _text: 'JH4DA9380PS016488' },
          'dVehicle.03': { _text: '50' },
          'dVehicle.04': { _text: '1404001' },
        });

        const draft = await parent.getDraft();
        assert(draft);
        assert(draft.isDraft);
        assert.deepStrictEqual(draft.id, '3465c833-2919-4565-8bde-a3ce70eaae8f');
        assert.deepStrictEqual(draft.draftParentId, '91986460-5a12-426d-9855-93227b47ead5');
        assert.deepStrictEqual(draft.number, 'Test Number');
        assert.deepStrictEqual(draft.callSign, 'Test Name');
        assert.deepStrictEqual(draft.data, {
          _attributes: {
            UUID: '91986460-5a12-426d-9855-93227b47ead5',
          },
          'dVehicle.01': { _text: 'Test Number' },
          'dVehicle.02': { _text: 'JH4DA9380PS016488' },
          'dVehicle.03': { _text: 'Test Name' },
          'dVehicle.04': { _text: '1404001' },
        });
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

        assert(record.isValid);
        assert.deepStrictEqual(record.data, {
          _attributes: {
            UUID: '4d71fd4a-ef2b-4a0c-aa11-214b5f54f8f7',
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
