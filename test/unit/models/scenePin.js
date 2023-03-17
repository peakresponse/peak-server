const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('ScenePin', () => {
    let user;
    let agency;
    let scene;
    beforeEach(async () => {
      await helpers.loadFixtures([
        'users',
        'cities',
        'states',
        'counties',
        'psaps',
        'agencies',
        'versions',
        'vehicles',
        'contacts',
        'employments',
        'scenes',
        'scenePins',
        'responders',
      ]);
      user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
      agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
      scene = await models.Scene.findByPk('25db9094-03a5-4267-8314-bead229eff9d');
    });

    it('creates a new Scene Pin', async () => {
      const pin = await models.ScenePin.createOrUpdate(user, agency, scene, {
        id: '74229e7f-885a-4568-9f68-97950289b9d9',
        type: models.ScenePin.Types.TRIAGE,
        lat: '37.785834',
        lng: '-122.406417',
        name: 'Test Name',
        desc: 'Test Desc',
      });
      assert(pin);
      assert.deepStrictEqual(pin.id, '74229e7f-885a-4568-9f68-97950289b9d9');
      assert.deepStrictEqual(pin.type, models.ScenePin.Types.TRIAGE);
      assert.deepStrictEqual(pin.lat, '37.785834');
      assert.deepStrictEqual(pin.lng, '-122.406417');
      assert.deepStrictEqual(pin.name, 'Test Name');
      assert.deepStrictEqual(pin.desc, 'Test Desc');
    });

    it('deletes prev Scene Pin and creates a new Scene Pin on update', async () => {
      const prevPin = await models.ScenePin.findByPk('f44fe602-516b-4c2c-a1b0-6ea5f3eef564', { rejectOnEmpty: true });
      assert.deepStrictEqual(prevPin.deletedAt, null);

      const pin = await models.ScenePin.createOrUpdate(user, agency, scene, {
        id: 'e97249c0-ed56-4e10-bf5b-44ddc8d3132d',
        prevPinId: 'f44fe602-516b-4c2c-a1b0-6ea5f3eef564',
        type: models.ScenePin.Types.OTHER,
        lat: '37.767087',
        lng: '-122.419977',
        name: 'Changed Other name',
        desc: 'Changed Other desc',
      });
      assert(pin);
      assert.deepStrictEqual(pin.id, 'e97249c0-ed56-4e10-bf5b-44ddc8d3132d');
      assert.deepStrictEqual(pin.prevPinId, 'f44fe602-516b-4c2c-a1b0-6ea5f3eef564');
      assert.deepStrictEqual(pin.type, models.ScenePin.Types.OTHER);
      assert.deepStrictEqual(pin.lat, '37.767087');
      assert.deepStrictEqual(pin.lng, '-122.419977');
      assert.deepStrictEqual(pin.name, 'Changed Other name');
      assert.deepStrictEqual(pin.desc, 'Changed Other desc');

      await prevPin.reload();
      assert(prevPin.deletedAt);
    });

    it('deletes and creates a new Scene Pin of the same type on update', async () => {
      const prevPin = await models.ScenePin.findByPk('7ce4ac99-e05f-4f7d-bb5f-65da4cac8a53', { rejectOnEmpty: true });
      assert.deepStrictEqual(prevPin.deletedAt, null);

      const pin = await models.ScenePin.createOrUpdate(user, agency, scene, {
        id: 'e97249c0-ed56-4e10-bf5b-44ddc8d3132d',
        type: models.ScenePin.Types.MGS,
        lat: '37.767087',
        lng: '-122.419977',
        name: 'Consolidated Incident Command',
        desc: 'Moved to join brigade chief',
      });
      assert(pin);
      assert.deepStrictEqual(pin.id, 'e97249c0-ed56-4e10-bf5b-44ddc8d3132d');
      assert.deepStrictEqual(pin.prevPinId, '7ce4ac99-e05f-4f7d-bb5f-65da4cac8a53');
      assert.deepStrictEqual(pin.type, models.ScenePin.Types.MGS);
      assert.deepStrictEqual(pin.lat, '37.767087');
      assert.deepStrictEqual(pin.lng, '-122.419977');
      assert.deepStrictEqual(pin.name, 'Consolidated Incident Command');
      assert.deepStrictEqual(pin.desc, 'Moved to join brigade chief');

      await prevPin.reload();
      assert(prevPin.deletedAt);
    });
  });
});
