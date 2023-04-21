const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../../helpers');
const app = require('../../../../app');
const models = require('../../../../models');

describe('/api/demographics/agency', () => {
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
      'agencies',
      'versions',
      'employments',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(200);
  });

  describe('GET /', () => {
    it('returns the Agency NEMSIS demographic info', async () => {
      const response = await testSession
        .get('/api/demographics/agency')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .expect(HttpStatus.OK);
      assert.deepStrictEqual(response.body.id, '9eeb6591-12f8-4036-8af8-6b235153d444');
      assert.deepStrictEqual(response.body.data, {
        'dAgency.01': { _text: 'S07-50120' },
        'dAgency.02': { _text: 'S07-50120' },
        'dAgency.03': { _text: 'Bay Medic Ambulance - Contra Costa' },
        'dAgency.04': { _text: '06' },
        'dAgency.AgencyServiceGroup': {
          _attributes: {
            UUID: 'da8710d1-e852-4713-9349-8673a5e3ea75',
          },
          'dAgency.05': {
            _text: '06',
          },
          'dAgency.06': {
            _text: '06013',
          },
          'dAgency.07': {
            _attributes: {
              NV: '7701003',
              'xsi:nil': 'true',
            },
          },
          'dAgency.08': {
            _attributes: {
              NV: '7701003',
              'xsi:nil': 'true',
            },
          },
        },
        'dAgency.09': {
          _text: '9920001',
        },
        'dAgency.11': {
          _text: '9917005',
        },
        'dAgency.12': {
          _text: '1016003',
        },
        'dAgency.13': {
          _text: '9912007',
        },
        'dAgency.14': {
          _text: '1018001',
        },
        'dAgency.25': {
          _attributes: {
            NV: '7701003',
            'xsi:nil': 'true',
          },
        },
        'dAgency.26': {
          _attributes: {
            NV: '7701003',
            'xsi:nil': 'true',
          },
        },
      });
    });
  });

  describe('PUT /', () => {
    it('updates the Agency demographics draft', async () => {
      const response = await testSession
        .put(`/api/demographics/agency`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          data: {
            'dAgency.01': { _text: 'S07-50120' },
            'dAgency.02': { _text: 'S07-50120' },
            'dAgency.03': { _text: 'Bay Medic Ambulance - Contra Costa' },
            'dAgency.04': { _text: '06' },
            'dAgency.AgencyServiceGroup': {
              _attributes: { UUID: 'efc2843f-d0aa-4d91-912b-e3a5c10ff7e1' },
              'dAgency.05': {},
              'dAgency.06': {},
              'dAgency.07': {},
              'dAgency.08': {},
            },
            'dAgency.09': {},
            'dAgency.11': {},
            'dAgency.12': {},
            'dAgency.13': {},
            'dAgency.14': {},
            'dAgency.25': {},
            'dAgency.26': {},
          },
        })
        .expect(HttpStatus.OK);

      const errors = [
        {
          path: `$['dAgency.AgencyServiceGroup'][0]['dAgency.05']`,
          message: 'This field is required.',
          value: '',
        },
        {
          path: `$['dAgency.AgencyServiceGroup'][0]['dAgency.06']`,
          message: 'This field is required.',
          value: '',
        },
        {
          path: `$['dAgency.AgencyServiceGroup'][0]['dAgency.07']`,
          message: 'This field is required.',
          value: '',
        },
        {
          path: `$['dAgency.AgencyServiceGroup'][0]['dAgency.08']`,
          message: 'This field is required.',
          value: '',
        },
        {
          path: `$['dAgency.09']`,
          message: 'This field is required.',
          value: '',
        },
        {
          path: `$['dAgency.11']`,
          message: 'This field is required.',
          value: '',
        },
        {
          path: `$['dAgency.12']`,
          message: 'This field is required.',
          value: '',
        },
        {
          path: `$['dAgency.13']`,
          message: 'This field is required.',
          value: '',
        },
        {
          path: `$['dAgency.14']`,
          message: 'This field is required.',
          value: '',
        },
        {
          path: `$['dAgency.25']`,
          message: 'This field is required.',
          value: null,
        },
        {
          path: `$['dAgency.26']`,
          message: 'This field is required.',
          value: null,
        },
      ];
      const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
      const draft = await agency.getDraft();
      assert(draft);
      assert(!draft.isValid);
      assert.deepStrictEqual(draft.validationErrors, {
        name: 'SchemaValidationError',
        errors,
      });
      assert.deepStrictEqual(response.body, {
        id: draft.id,
        isDraft: true,
        data: draft.data,
        isValid: draft.isValid,
        validationErrors: draft.validationErrors,
        updatedAt: response.body.updatedAt,
        createdAt: response.body.createdAt,
      });
      assert(draft.versionId);
      assert.notDeepStrictEqual(draft.versionId, agency.versionId);
    });
  });

  describe('DELETE /', () => {
    it('deletes the draft Agency record', async () => {
      await testSession
        .put(`/api/demographics/agency`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          data: {
            'dAgency.01': { _text: 'S07-50120' },
            'dAgency.02': { _text: 'S07-50120' },
            'dAgency.03': { _text: 'Bay Medic Ambulance - Contra Costa' },
            'dAgency.04': { _text: '06' },
          },
        })
        .expect(HttpStatus.OK);
      const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
      const draft = await agency.getDraft();
      assert(draft);

      await testSession.delete(`/api/demographics/agency`).set('Host', `bmacc.${process.env.BASE_HOST}`).expect(HttpStatus.NO_CONTENT);
      await agency.reload();
      assert.deepStrictEqual(await agency.getDraft(), null);
    });
  });
});
