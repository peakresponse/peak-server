const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../../helpers');
const app = require('../../../app');
const models = require('../../../models');

describe('/api/reports', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'cities',
      'counties',
      'states',
      'agencies',
      'users',
      'contacts',
      'employments',
      'psaps',
      'dispatchers',
      'scenes',
      'incidents',
      'vehicles',
      'dispatches',
      'responders',
      'responses',
      'times',
      'situations',
      'dispositions',
      'histories',
      'narratives',
      'reports',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(HttpStatus.OK);
  });

  describe('POST /', () => {
    it('creates a new Report', async () => {
      const data = {
        Narrative: {
          id: '89529548-19f7-4a17-b7d3-ad783c575f63',
          canonicalId: '1460a121-c817-4d8d-8d79-c1daec66946d',
          data: {
            'eNarrative.01': {
              _text: 'This is the narrative text.',
            },
          },
        },
        Report: {
          id: '2f1b5eb1-4689-41ef-8d88-aeda834a99ac',
          canonicalId: '90cf28b8-a59f-4ca2-8a4b-7756e1c0bd9e',
          narrativeId: '89529548-19f7-4a17-b7d3-ad783c575f63',
          data: {
            'eRecord.01': {
              _text: '90cf28b8-a59f-4ca2-8a4b-7756e1c0bd9e',
            },
            'eRecord.SoftwareApplicationGroup': {
              'eRecord.02': {
                _text: 'Peak Response Inc',
              },
              'eRecord.03': {
                _text: 'Peak Response',
              },
              'eRecord.04': {
                _text: 'Integration test version 1',
              },
            },
          },
        },
      };
      await testSession.post(`/api/reports`).set('Host', `bmacc.${process.env.BASE_HOST}`).send(data).expect(HttpStatus.CREATED);

      const report = await models.Report.findByPk('2f1b5eb1-4689-41ef-8d88-aeda834a99ac');
      assert(report);
      assert.deepStrictEqual(report.data, data.Report.data);
      assert.deepStrictEqual(report.updatedAttributes, ['id', 'canonicalId', 'data', 'narrativeId']);
      assert.deepStrictEqual(report.updatedDataAttributes, ['/eRecord.01', '/eRecord.SoftwareApplicationGroup']);

      const narrative = await report.getNarrative();
      assert(narrative);
      assert.deepStrictEqual(narrative.id, data.Narrative.id);
      assert.deepStrictEqual(narrative.data, data.Narrative.data);

      const canonical = await report.getCanonical();
      assert(canonical);
      assert.deepStrictEqual(canonical.data, report.data);
      assert.deepStrictEqual(canonical.narrativeId, report.narrativeId);
    });

    it('updates an existing Report', async () => {
      const data = {
        Narrative: {
          id: '3082e66f-7ed8-4488-857b-b49364356ab1',
          parentId: 'c5fa9054-c293-4a3f-a8c4-e11eef6a7e8f',
          data: {
            'eNarrative.01': {
              _text: 'This is the updated narrative text.',
            },
          },
        },
        Report: {
          id: 'da67b07b-144b-42c3-85f4-b3ce1bc8d235',
          parentId: 'c19bb731-5e9e-4feb-9192-720782ecf9a8',
          narrativeId: '3082e66f-7ed8-4488-857b-b49364356ab1',
          data_patch: [
            {
              op: 'replace',
              path: '/eRecord.SoftwareApplicationGroup/eRecord.04/_text',
              value: 'Integration test version 2',
            },
          ],
        },
      };
      await testSession.post(`/api/reports`).set('Host', `bmacc.${process.env.BASE_HOST}`).send(data).expect(HttpStatus.OK);

      const report = await models.Report.findByPk('da67b07b-144b-42c3-85f4-b3ce1bc8d235');
      assert(report);
      assert.deepStrictEqual(report.data, {
        'eRecord.01': {
          _text: '9242e8de-9d22-457f-96c8-00a43dfc1f3a',
        },
        'eRecord.SoftwareApplicationGroup': {
          'eRecord.02': {
            _text: 'Peak Response Inc',
          },
          'eRecord.03': {
            _text: 'Peak Response',
          },
          'eRecord.04': {
            _text: 'Integration test version 2',
          },
        },
      });
      assert.deepStrictEqual(report.updatedAttributes, ['id', 'parentId', 'narrativeId', 'data']);
      assert.deepStrictEqual(report.updatedDataAttributes, ['/eRecord.SoftwareApplicationGroup/eRecord.04']);

      const narrative = await report.getNarrative();
      assert(narrative);
      assert.deepStrictEqual(narrative.id, data.Narrative.id);
      assert.deepStrictEqual(narrative.data, data.Narrative.data);
      assert.deepStrictEqual(narrative.updatedAttributes, ['id', 'parentId', 'data']);
      assert.deepStrictEqual(narrative.updatedDataAttributes, ['/eNarrative.01']);

      const canonical = await report.getCanonical();
      assert(canonical);
      assert.deepStrictEqual(canonical.data, report.data);
      assert.deepStrictEqual(canonical.narrativeId, report.narrativeId);

      const versions = await canonical.getVersions();
      assert.deepStrictEqual(versions.length, 2);
    });
  });
});
