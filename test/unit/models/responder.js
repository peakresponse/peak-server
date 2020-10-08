const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Responder', () => {
    beforeEach(async () => {
      await helpers.loadFixtures([
        'users',
        'states',
        'agencies',
        'contacts',
        'employments',
        'scenes',
        'sceneObservations',
        'responders',
      ]);
    });

    describe('.assign()', () => {
      it('assigns a Role to a Responder', async () => {
        const user = await models.User.findByPk(
          'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          { rejectOnEmpty: true }
        );
        const agency = await models.Agency.findByPk(
          '9eeb6591-12f8-4036-8af8-6b235153d444',
          { rejectOnEmpty: true }
        );

        const responder1 = await models.Responder.findByPk(
          'c5fb3154-abec-49f2-af0b-bcd4c859510e',
          { rejectOnEmpty: true }
        );
        assert.deepStrictEqual(responder1.role, null);
        let ids = await responder1.assign(
          user,
          agency,
          models.Responder.Roles.TRIAGE
        );
        assert.deepStrictEqual(ids, ['c5fb3154-abec-49f2-af0b-bcd4c859510e']);
        await responder1.reload();
        assert.deepStrictEqual(responder1.role, models.Responder.Roles.TRIAGE);

        /// assign to another responder
        const responder2 = await models.Responder.findByPk(
          '5d0b9f69-7bd4-4674-a2ef-9e0afdc14705'
        );
        ids = await responder2.assign(
          user,
          agency,
          models.Responder.Roles.TRIAGE
        );
        assert.deepStrictEqual(ids, [
          'c5fb3154-abec-49f2-af0b-bcd4c859510e',
          '5d0b9f69-7bd4-4674-a2ef-9e0afdc14705',
        ]);
        await responder2.reload();
        assert.deepStrictEqual(responder2.role, models.Responder.Roles.TRIAGE);
        assert.deepStrictEqual(responder2.updatedById, user.id);
        assert.deepStrictEqual(responder2.updatedByAgencyId, agency.id);
        /// should clear the role from the previous responder
        await responder1.reload();
        assert.deepStrictEqual(responder1.role, null);
      });
    });

    describe('.toJSON()', () => {
      it('returns the base JSON representation of a record', async () => {
        const responder = await models.Responder.findByPk(
          'c5fb3154-abec-49f2-af0b-bcd4c859510e'
        );
        assert(responder);
        const json = responder.toJSON();
        assert.deepStrictEqual(JSON.parse(JSON.stringify(json)), {
          id: 'c5fb3154-abec-49f2-af0b-bcd4c859510e',
          sceneId: '7b8ddcc3-63e6-4e6e-a47e-d553289912d1',
          userId: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          agencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
          arrivedAt: '2020-04-06T21:22:10.102Z',
          departedAt: null,
          role: null,
          createdById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          updatedById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          createdByAgencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
          updatedByAgencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
          createdAt: '2020-04-06T21:22:10.102Z',
          updatedAt: JSON.parse(JSON.stringify(responder.updatedAt)), // updatedAt gets overwritten during fixture load
        });
      });
    });

    describe('.toFullJSON()', () => {
      it('returns the JSON representation of a record with User and Agency records expanded', async () => {
        const responder = await models.Responder.findByPk(
          'c5fb3154-abec-49f2-af0b-bcd4c859510e',
          {
            include: [
              { model: models.Agency, as: 'agency' },
              { model: models.User, as: 'user' },
            ],
          }
        );
        assert(responder);
        const json = await responder.toFullJSON();
        assert.deepStrictEqual(JSON.parse(JSON.stringify(json)), {
          id: 'c5fb3154-abec-49f2-af0b-bcd4c859510e',
          sceneId: '7b8ddcc3-63e6-4e6e-a47e-d553289912d1',
          user: {
            id: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
            firstName: 'Regular',
            lastName: 'User',
            email: 'regular@peakresponse.net',
            position: 'Paramedic',
            iconUrl: null,
          },
          userId: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          agency: {
            id: '9eeb6591-12f8-4036-8af8-6b235153d444',
            stateUniqueId: 'S07-50120',
            number: 'S07-50120',
            name: 'Bay Medic Ambulance - Contra Costa',
            stateId: '06',
          },
          agencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
          arrivedAt: '2020-04-06T21:22:10.102Z',
          departedAt: null,
          role: null,
          createdById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          updatedById: 'ffc7a312-50ba-475f-b10f-76ce793dc62a',
          createdByAgencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
          updatedByAgencyId: '9eeb6591-12f8-4036-8af8-6b235153d444',
          createdAt: '2020-04-06T21:22:10.102Z',
          updatedAt: JSON.parse(JSON.stringify(responder.updatedAt)), // updatedAt gets overwritten during fixture load
        });
      });
    });
  });
});
