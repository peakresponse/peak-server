/* eslint-disable func-names, no-await-in-loop */
const assert = require('assert');
const xmlFormatter = require('xml-formatter');
const xmljs = require('xml-js');

require('../../helpers');
const nemsis = require('../../../lib/nemsis');

describe('lib', () => {
  describe('nemsis', () => {
    describe('getErrorPath()', () => {
      it('returns a JSON path equivalent to the specified line in xml', () => {
        const doc = {
          dAgency: {
            'dAgency.01': { _text: 'DEMO-001' },
            'dAgency.02': { _text: 'DEMO-001' },
            'dAgency.03': { _text: 'Test\nMulti\n<Line>\n' },
            'dAgency.04': { _text: '06' },
            'dAgency.AgencyServiceGroup': [
              {
                'dAgency.05': { _text: '06' },
                'dAgency.06': { _text: '06075' },
                'dAgency.07': { _attributes: { NV: '7701003', 'xsi:nil': 'true' } },
                'dAgency.08': { _attributes: { NV: '7701003', 'xsi:nil': 'true' } },
                _attributes: { UUID: '35ec5787-9483-4f0a-b00a-6d7d70c92df8' },
              },
              {
                'dAgency.05': {},
                'dAgency.06': {},
                'dAgency.07': {},
                'dAgency.08': {},
                _attributes: { UUID: '1eaba43d-8fda-4b69-be87-dfd76ac4bbda' },
              },
            ],
            'dAgency.09': { _text: '9920001' },
            'dAgency.10': [{ _text: '9920003' }, { _text: '9920017' }],
            'dAgency.11': { _text: '9917005' },
            'dAgency.12': { _text: '1016005' },
            'dAgency.13': { _text: '9912007' },
            'dAgency.14': { _text: '1018001' },
            'dAgency.23': { _text: '1027011' },
            'dAgency.24': { _text: '9923003' },
            'dAgency.25': { _attributes: { NV: '7701001', 'xsi:nil': 'true' } },
            'dAgency.26': { _attributes: { NV: '7701001', 'xsi:nil': 'true' } },
          },
        };
        const lines = xmlFormatter(xmljs.js2xml(doc, { compact: true }), {
          collapseContent: true,
          lineSeparator: '\n',
          indentation: '\t',
        }).split('\n');
        assert.deepStrictEqual(nemsis.getErrorPath(doc, lines, 15), `$['dAgency.AgencyServiceGroup'][1]['dAgency.05']`);
        assert.deepStrictEqual(nemsis.getErrorPath(doc, lines, 21), `$['dAgency.10'][0]`);
      });
    });

    describe('validateSchema()', () => {
      it('returns schema validation errors', async () => {
        const result = await nemsis.validateSchema('dAgency_v3.xsd', 'dAgency', null, {
          'dAgency.01': { _text: 'DEMO-001' },
          'dAgency.02': { _text: 'DEMO-001' },
          'dAgency.03': { _text: 'Test\nMulti\n<Line>\n' },
          'dAgency.04': { _text: '06' },
          'dAgency.09': { _text: '9920001' },
          'dAgency.10': [{ _text: '9920003' }, { _text: '9920017' }],
          'dAgency.11': { _text: '9917005' },
          'dAgency.12': { _text: '1016005' },
          'dAgency.13': { _text: '9912007' },
          'dAgency.14': { _text: '1018001' },
          'dAgency.23': { _text: '1027011' },
          'dAgency.24': { _text: '9923003' },
          'dAgency.25': { _attributes: { NV: '7701001', 'xsi:nil': 'true' } },
          'dAgency.26': { _attributes: { NV: '7701001', 'xsi:nil': 'true' } },
          'dAgency.AgencyServiceGroup': [
            {
              'dAgency.05': { _text: '06' },
              'dAgency.06': { _text: '06075' },
              'dAgency.07': { _attributes: { NV: '7701003', 'xsi:nil': 'true' } },
              'dAgency.08': { _attributes: { NV: '7701003', 'xsi:nil': 'true' } },
              _attributes: { UUID: '35ec5787-9483-4f0a-b00a-6d7d70c92df8' },
            },
            {
              'dAgency.05': {},
              'dAgency.06': {},
              'dAgency.07': {},
              'dAgency.08': {},
              _attributes: { UUID: '1eaba43d-8fda-4b69-be87-dfd76ac4bbda' },
            },
          ],
        });
        assert.deepStrictEqual(result, {
          name: 'SchemaValidationError',
          errors: [
            {
              path: "$['dAgency.AgencyServiceGroup'][1]['dAgency.05']",
              message: 'This field is required.',
              value: '',
            },
            {
              path: "$['dAgency.AgencyServiceGroup'][1]['dAgency.06']",
              message: 'This field is required.',
              value: '',
            },
            {
              path: "$['dAgency.AgencyServiceGroup'][1]['dAgency.07']",
              message: 'This field is required.',
              value: '',
            },
            {
              path: "$['dAgency.AgencyServiceGroup'][1]['dAgency.08']",
              message: 'This field is required.',
              value: '',
            },
          ],
        });
      });
    });
  });
});
