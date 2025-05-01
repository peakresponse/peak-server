const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Scene', () => {
    beforeEach(async () => {
      await helpers.loadFixtures([
        'cities',
        'counties',
        'states',
        'users',
        'psaps',
        'nemsisStateDataSets',
        'nemsisSchematrons',
        'regions',
        'agencies',
        'venues',
        'facilities',
        'versions',
        'vehicles',
        'contacts',
        'employments',
        'dispatchers',
        'scenes',
        'patients',
        'responders',
        'incidents',
        'vehicles',
        'assignments',
        'dispatches',
        'responses',
        'times',
        'situations',
        'dispositions',
        'histories',
        'narratives',
        'medications',
        'vitals',
        'procedures',
        'files',
        'reports',
      ]);
    });

    describe('createOrUpdate()', () => {
      it('creates a new canonical and corresponding history record', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');

        const data = {
          id: 'fef7d4da-28e7-4423-9975-624eb2d11275',
          canonicalId: '69928e17-c8fb-47db-8597-5591b8dda33a',
          name: 'New Scene',
        };
        const [record, created] = await models.Scene.createOrUpdate(user, agency, data);
        assert(record);
        assert(created);
        assert.deepStrictEqual(record.id, data.id);
        assert.deepStrictEqual(record.parentId, null);
        assert.deepStrictEqual(record.canonicalId, data.canonicalId);
        assert.deepStrictEqual(record.name, 'New Scene');
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'canonicalId', 'name']);
        assert.deepStrictEqual(record.createdById, user.id);
        assert.deepStrictEqual(record.updatedById, user.id);
        assert.deepStrictEqual(record.createdByAgencyId, agency.id);
        assert.deepStrictEqual(record.updatedByAgencyId, agency.id);

        const canonical = await record.getCanonical();
        assert(canonical);
        assert.deepStrictEqual(canonical.id, data.canonicalId);
        assert.deepStrictEqual(canonical.parentId, null);
        assert.deepStrictEqual(canonical.canonicalId, null);
        assert.deepStrictEqual(canonical.name, 'New Scene');
        assert.deepStrictEqual(canonical.createdById, user.id);
        assert.deepStrictEqual(canonical.updatedById, user.id);
        assert.deepStrictEqual(canonical.createdByAgencyId, agency.id);
        assert.deepStrictEqual(canonical.updatedByAgencyId, agency.id);
      });

      it('updates an existing canonical record and creates a corresponding history record', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');

        await models.Responder.createOrUpdate(user, agency, {
          id: '79ba407e-66ce-488b-b70c-2231bf38567c',
          sceneId: 'bc69d0d0-1cac-4c11-aa98-7cb1e5e7018c',
          userId: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          agencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
          arrivedAt: '2020-04-06T21:22:10.102Z',
        });

        const data = {
          id: '7f263c9d-5304-4c44-9cce-47b1b3743cdd',
          parentId: 'c7e97d09-dc4b-4b4e-963c-b0ba066934c1',
          isMCI: true,
          mgsResponderId: '79ba407e-66ce-488b-b70c-2231bf38567c',
        };
        const [record, created] = await models.Scene.createOrUpdate(user, agency, data);
        assert(record);
        assert(!created);
        assert.deepStrictEqual(record.id, data.id);
        assert.deepStrictEqual(record.parentId, data.parentId);
        const parent = await record.getParent();
        assert.deepStrictEqual(record.canonicalId, parent.canonicalId);
        assert(record.isMCI);
        assert.deepStrictEqual(record.mgsResponderId, '79ba407e-66ce-488b-b70c-2231bf38567c');
        assert.deepStrictEqual(record.createdById, parent.createdById);
        assert.deepStrictEqual(record.updatedById, user.id);
        assert.deepStrictEqual(record.createdByAgencyId, parent.createdByAgencyId);
        assert.deepStrictEqual(record.updatedByAgencyId, agency.id);
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'parentId', 'isMCI', 'mgsResponderId']);

        const canonical = await record.getCanonical();
        assert.deepStrictEqual(canonical.parentId, null);
        assert.deepStrictEqual(canonical.canonicalId, null);
        assert(canonical.isMCI);
        assert.deepStrictEqual(canonical.mgsResponderId, '79ba407e-66ce-488b-b70c-2231bf38567c');
        assert.deepStrictEqual(canonical.createdById, record.createdById);
        assert.deepStrictEqual(canonical.updatedById, record.updatedById);
        assert.deepStrictEqual(canonical.createdByAgencyId, record.createdByAgencyId);
        assert.deepStrictEqual(canonical.updatedByAgencyId, record.updatedByAgencyId);

        const responders = await canonical.getResponders();
        assert.deepStrictEqual(responders.length, 1);
        assert.deepStrictEqual(responders[0].id, '79ba407e-66ce-488b-b70c-2231bf38567c');
        assert.deepStrictEqual(responders[0].userId, 'ffc7a312-50ba-475f-b10f-76ce793dc62a');
        assert.deepStrictEqual(responders[0].agencyId, '9eeb6591-12f8-4036-8af8-6b235153d444');
      });

      it('merges parallel/out-of-order updates into a new record', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');

        let data = {
          id: '70336540-1d74-40fb-913b-2904a0ba66dc',
          parentId: 'c7e97d09-dc4b-4b4e-963c-b0ba066934c1',
          approxPatientsCount: 2,
          approxPriorityPatientsCounts: [2, 0, 0, 0, 0, 0],
          updatedAt: '2020-04-06T21:23:10.102Z',
        };
        let [record, created] = await models.Scene.createOrUpdate(user, agency, data);
        assert(record);
        assert.deepStrictEqual(record.approxPatientsCount, 2);
        assert.deepStrictEqual(record.approxPriorityPatientsCounts, [2, 0, 0, 0, 0, 0]);
        assert.deepStrictEqual(record.updatedAt, new Date('2020-04-06T21:23:10.102Z'));
        assert(!created);

        let canonical = await record.getCanonical();
        assert.deepStrictEqual(canonical.approxPatientsCount, 2);
        assert.deepStrictEqual(canonical.approxPriorityPatientsCounts, [2, 0, 0, 0, 0, 0]);

        data = {
          id: '7fc6eb46-0660-46c6-8355-5ba94e1b17bf',
          parentId: 'c7e97d09-dc4b-4b4e-963c-b0ba066934c1',
          approxPatientsCount: 1,
          approxPriorityPatientsCounts: [0, 1, 0, 0, 0, 0],
          updatedAt: '2020-04-06T21:23:09.102Z',
        };
        [record, created] = await models.Scene.createOrUpdate(user, agency, data);
        assert(record);
        assert(!created);
        assert.deepStrictEqual(record.parentId, '70336540-1d74-40fb-913b-2904a0ba66dc');
        assert.deepStrictEqual(record.secondParentId, '7fc6eb46-0660-46c6-8355-5ba94e1b17bf');
        assert.deepStrictEqual(record.approxPatientsCount, 2);
        assert.deepStrictEqual(record.approxPriorityPatientsCounts, [2, 1, 0, 0, 0, 0]);

        canonical = await record.getCanonical();
        assert.deepStrictEqual(canonical.approxPatientsCount, 2);
        assert.deepStrictEqual(canonical.approxPriorityPatientsCounts, [2, 1, 0, 0, 0, 0]);
      });
    });
  });
});
