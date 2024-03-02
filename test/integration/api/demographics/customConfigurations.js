const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../../helpers');
const app = require('../../../../app');
const models = require('../../../../models');
const nemsisStates = require('../../../../lib/nemsis/states');

describe('/api/demographics/custom-configurations', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'users',
      'states',
      'counties',
      'cities',
      'psaps',
      'nemsisStateDataSets',
      'nemsisSchematrons',
      'regions',
      'agencies',
      'versions',
      'employments',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(StatusCodes.OK);
  });

  describe('POST /', () => {
    it('creates a new draft DEM Custom Configuration', async () => {
      const response = await testSession
        .post('/api/demographics/custom-configurations')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          data: {
            _attributes: { CustomElementID: 'dFacility.01' },
            'dCustomConfiguration.01': { _text: 'Type of Facility', _attributes: { nemsisElement: 'dFacility.01' } },
            'dCustomConfiguration.02': {
              _text: 'The type of facility (healthcare or other) that the EMS agency transports patients to or from.',
            },
            'dCustomConfiguration.03': { _text: '9902009' },
            'dCustomConfiguration.04': { _text: '9923001' },
            'dCustomConfiguration.05': { _text: '9903007' },
            'dCustomConfiguration.06': {
              _text: '1701037',
              _attributes: { nemsisCode: '1701009', customValueDescription: 'Alternate Care Site' },
            },
          },
        })
        .expect(StatusCodes.CREATED);

      assert.deepStrictEqual(response.body?.data?._attributes?.CustomElementID, 'dFacility.01');

      const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
      const draftVersion = await agency.getDraftVersion();
      assert.deepStrictEqual(draftVersion.demCustomConfiguration?.length, 1);
      assert.deepStrictEqual(draftVersion.demCustomConfiguration[0]?._attributes?.CustomElementID, 'dFacility.01');
    });
  });

  describe('POST /import', () => {
    it('creates new draft DEM Custom Configurations from NEMSIS State Data Set', async () => {
      const repo = nemsisStates.getNemsisStateRepo('06', '3.5.0');
      await repo.pull();

      const response = await testSession
        .post('/api/demographics/custom-configurations/import')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(StatusCodes.OK);

      assert.deepStrictEqual(response.body?.length, 2);
      assert.deepStrictEqual(response.body[0].data?._attributes?.CustomElementID, 'dAgency.11');
      assert.deepStrictEqual(response.body[1].data?._attributes?.CustomElementID, 'dAgency.13');

      const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
      const draftVersion = await agency.getDraftVersion();
      assert.deepStrictEqual(draftVersion.demCustomConfiguration?.length, 2);
      assert.deepStrictEqual(draftVersion.demCustomConfiguration[0]?._attributes?.CustomElementID, 'dAgency.11');
      assert.deepStrictEqual(draftVersion.demCustomConfiguration[1]?._attributes?.CustomElementID, 'dAgency.13');
    });
  });

  describe('PUT /:id', () => {
    it('updates an existing DEM Custom Configuration', async () => {
      await helpers.loadFixtures(['customConfigurations']);
      const response = await testSession
        .put('/api/demographics/custom-configurations/a8d82dff-941b-41b4-859e-1b12fb617221')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          data: {
            _attributes: { CustomElementID: 'dFacility.01' },
            'dCustomConfiguration.01': { _text: 'Type of Facility', _attributes: { nemsisElement: 'dFacility.01' } },
            'dCustomConfiguration.02': {
              _text: 'Updating this element text for the update',
            },
            'dCustomConfiguration.03': { _text: '9902009' },
            'dCustomConfiguration.04': { _text: '9923001' },
            'dCustomConfiguration.05': { _text: '9903007' },
            'dCustomConfiguration.06': {
              _text: '1701037',
              _attributes: { nemsisCode: '1701009', customValueDescription: 'Alternate Care Site' },
            },
          },
        })
        .expect(StatusCodes.OK);

      assert.deepStrictEqual(response.body?.data?.['dCustomConfiguration.02']?._text, 'Updating this element text for the update');

      const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
      const draftVersion = await agency.getDraftVersion();
      assert.deepStrictEqual(draftVersion.demCustomConfiguration?.length, 1);
      assert.deepStrictEqual(
        draftVersion.demCustomConfiguration[0]?.['dCustomConfiguration.02']?._text,
        'Updating this element text for the update',
      );
    });
  });

  describe('DELETE /:id', () => {
    it('deletes an existing DEM Custom Configuration', async () => {
      await helpers.loadFixtures(['customConfigurations']);
      await testSession
        .delete('/api/demographics/custom-configurations/a8d82dff-941b-41b4-859e-1b12fb617221')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(StatusCodes.NO_CONTENT);

      const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
      const draftVersion = await agency.getDraftVersion();
      assert.deepStrictEqual(draftVersion.demCustomConfiguration?.length, 0);
    });
  });
});
