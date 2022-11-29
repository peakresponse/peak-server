const assert = require('assert');
const moment = require('moment');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Dispatch', () => {
    beforeEach(async () => {
      await helpers.loadFixtures([
        'states',
        'counties',
        'cities',
        'users',
        'psaps',
        'agencies',
        'employments',
        'dispatchers',
        'scenes',
        'incidents',
        'vehicles',
        'dispatches',
      ]);
    });

    describe('createOrUpdate()', () => {
      it('creates a new canonical and corresponding history Dispatch record', async () => {
        const user = await models.User.findByPk('4ca8b1a0-e981-4ef0-88d2-6c9f69f0414c');
        const now = moment().toISOString();
        const data = {
          id: 'ce9151bf-090c-45c6-80ff-a0c17ba26065',
          canonicalId: '399c6daf-66db-4845-8fbf-2930477b7e61',
          incidentId: '6621202f-ca09-4ad9-be8f-b56346d1de65',
          vehicleId: 'e8d22910-7962-48f4-8a04-f511b8bf90dd',
          dispatchedAt: now,
        };
        let [dispatch, created] = await models.Dispatch.createOrUpdate(user, null, data);
        assert(dispatch);
        assert(created);
        assert.deepStrictEqual(dispatch.id, data.id);
        assert.deepStrictEqual(dispatch.parentId, null);
        assert.deepStrictEqual(dispatch.canonicalId, data.canonicalId);
        assert.deepStrictEqual(dispatch.incidentId, data.incidentId);
        assert.deepStrictEqual(dispatch.vehicleId, data.vehicleId);
        assert.deepStrictEqual(dispatch.createdById, user.id);
        assert.deepStrictEqual(dispatch.updatedById, user.id);
        assert.deepStrictEqual(dispatch.createdByAgencyId, null);
        assert.deepStrictEqual(dispatch.updatedByAgencyId, null);
        assert.deepStrictEqual(moment(dispatch.dispatchedAt).toISOString(), data.dispatchedAt);

        const canonical = await models.Dispatch.findByPk('399c6daf-66db-4845-8fbf-2930477b7e61');
        assert(canonical);
        assert.deepStrictEqual(canonical.id, data.canonicalId);
        assert.deepStrictEqual(canonical.parentId, null);
        assert.deepStrictEqual(canonical.canonicalId, null);
        assert.deepStrictEqual(canonical.incidentId, data.incidentId);
        assert.deepStrictEqual(canonical.vehicleId, data.vehicleId);
        assert.deepStrictEqual(canonical.createdById, user.id);
        assert.deepStrictEqual(canonical.updatedById, user.id);
        assert.deepStrictEqual(canonical.createdByAgencyId, null);
        assert.deepStrictEqual(canonical.updatedByAgencyId, null);
        assert.deepStrictEqual(moment(canonical.dispatchedAt).toISOString(), data.dispatchedAt);

        // records should be immutable and idempodent, sending data with same id returns existing record
        [dispatch, created] = await models.Dispatch.createOrUpdate(user, null, { ...data, dispatchedAt: null });
        assert(dispatch);
        assert(!created);
        assert.deepStrictEqual(dispatch.id, data.id);
        assert.deepStrictEqual(dispatch.parentId, null);
        assert.deepStrictEqual(dispatch.canonicalId, data.canonicalId);
        assert.deepStrictEqual(dispatch.incidentId, data.incidentId);
        assert.deepStrictEqual(dispatch.vehicleId, data.vehicleId);
        assert.deepStrictEqual(dispatch.createdById, user.id);
        assert.deepStrictEqual(dispatch.updatedById, user.id);
        assert.deepStrictEqual(dispatch.createdByAgencyId, null);
        assert.deepStrictEqual(dispatch.updatedByAgencyId, null);
        assert.deepStrictEqual(moment(dispatch.dispatchedAt).toISOString(), data.dispatchedAt);
      });

      it('updates an existing canonical record and creates a corresponding history Dispatch record', async () => {
        const user = await models.User.findByPk('9eb5be23-c098-495c-a758-ce1def3ff541');
        const agency = await models.Agency.findByPk('6bdc8680-9fa5-4ce3-86d9-7df940a7c4d8');
        const now = moment().toISOString();
        const data = {
          id: 'c25d6127-5cb9-4ca2-845d-37fb19a36e4b',
          parentId: '374450ef-99e3-4554-9298-c8b70373d63f',
          acknowledgedAt: now,
        };
        const [dispatch, created] = await models.Dispatch.createOrUpdate(user, agency, data);
        assert(dispatch);
        assert(!created);
        assert.deepStrictEqual(dispatch.id, data.id);
        assert.deepStrictEqual(dispatch.parentId, data.parentId);
        const parent = await dispatch.getParent();
        assert.deepStrictEqual(dispatch.canonicalId, parent.canonicalId);
        assert.deepStrictEqual(dispatch.incidentId, parent.incidentId);
        assert.deepStrictEqual(dispatch.vehicleId, parent.vehicleId);
        assert.deepStrictEqual(dispatch.createdById, parent.createdById);
        assert.deepStrictEqual(dispatch.updatedById, user.id);
        assert.deepStrictEqual(dispatch.createdByAgencyId, parent.createdByAgencyId);
        assert.deepStrictEqual(dispatch.updatedByAgencyId, agency.id);
        assert.deepStrictEqual(dispatch.dispatchedAt, parent.dispatchedAt);
        assert.deepStrictEqual(moment(dispatch.acknowledgedAt).toISOString(), data.acknowledgedAt);
        assert.deepStrictEqual(dispatch.updatedAttributes, ['id', 'parentId', 'acknowledgedAt']);

        const canonical = await dispatch.getCanonical();
        assert.deepStrictEqual(canonical.parentId, null);
        assert.deepStrictEqual(canonical.canonicalId, null);
        assert.deepStrictEqual(canonical.incidentId, dispatch.incidentId);
        assert.deepStrictEqual(canonical.vehicleId, dispatch.vehicleId);
        assert.deepStrictEqual(canonical.createdById, dispatch.createdById);
        assert.deepStrictEqual(canonical.updatedById, dispatch.updatedById);
        assert.deepStrictEqual(canonical.createdByAgencyId, dispatch.createdByAgencyId);
        assert.deepStrictEqual(canonical.updatedByAgencyId, dispatch.updatedByAgencyId);
        assert.deepStrictEqual(canonical.dispatchedAt, dispatch.dispatchedAt);
        assert.deepStrictEqual(canonical.acknowledgedAt, dispatch.acknowledgedAt);
      });

      it('validates NEMSIS data against the schema', async () => {
        const user = await models.User.findByPk('9eb5be23-c098-495c-a758-ce1def3ff541');
        const agency = await models.Agency.findByPk('6bdc8680-9fa5-4ce3-86d9-7df940a7c4d8');
        const data = {
          id: 'c25d6127-5cb9-4ca2-845d-37fb19a36e4b',
          parentId: '374450ef-99e3-4554-9298-c8b70373d63f',
          data: {
            'eDispatch.01': {
              _text: '2301021',
            },
            'eDispatch.02': {
              _text: '2302001',
            },
          },
        };
        const [dispatch, created] = await models.Dispatch.createOrUpdate(user, agency, data);
        assert(dispatch);
        assert(!created);
        assert(dispatch.isValid);
        assert(dispatch.updatedAttributes, ['parentId', 'data']);
        assert(dispatch.updatedDataAttributes, ['/eDispatch.01', '/eDispatch.02']);
      });
    });
  });
});
