const assert = require('assert');
const fs = require('fs-extra');
const { mkdirp } = require('mkdirp');
const path = require('path');
const uuid = require('uuid/v4');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Signature', () => {
    beforeEach(async () => {
      await helpers.loadFixtures([
        'states',
        'counties',
        'cities',
        'users',
        'psaps',
        'agencies',
        'versions',
        'employments',
        'forms',
        'signatures',
      ]);
    });

    describe('createOrUpdate()', () => {
      let file;
      beforeEach(() => {
        file = `${uuid()}.png`;
        mkdirp.sync(path.resolve(__dirname, '../../../tmp/uploads'));
        fs.copySync(path.resolve(__dirname, '../../fixtures/files/512x512.png'), path.resolve(__dirname, `../../../tmp/uploads/${file}`));
      });

      afterEach(() => {
        fs.removeSync(path.resolve(__dirname, `../../../tmp/uploads/${file}`));
        fs.removeSync(path.resolve(__dirname, `../../../public/assets/test`));
      });

      it('creates a new canonical and corresponding history record', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const data = {
          id: '20359ca2-8c0e-45b1-aa02-14312f0e3f7b',
          canonicalId: '06c94d0a-7e91-4de0-a287-8c3c4f3eb3a4',
          formId: '7f1488f9-dff8-42dc-8d7b-4b01073c15b9',
          formInstanceId: 'b5adf898-372d-43d4-a10c-ab521d7c7e46',
          file,
          data: {
            'eOther.12': {
              _text: '4512015',
            },
            'eOther.13': {
              _text: '4513003',
            },
            'eOther.15': {
              _text: '4515031',
            },
            'eOther.16': {
              _text: file,
            },
            'eOther.17': {
              _text: 'png',
            },
            'eOther.20': {
              _text: 'John',
            },
            'eOther.21': {
              _text: 'Doe',
            },
          },
        };
        const [record, created] = await models.Signature.createOrUpdate(user, agency, data);
        assert(record);
        assert(created);
        assert.deepStrictEqual(record.id, data.id);
        assert.deepStrictEqual(record.parentId, null);
        assert.deepStrictEqual(record.canonicalId, data.canonicalId);
        assert.deepStrictEqual(record.formId, data.formId);
        assert.deepStrictEqual(record.formInstanceId, data.formInstanceId);
        assert.deepStrictEqual(record.file, file);
        assert.deepStrictEqual(record.fileUrl, `/api/assets/signatures/${record.id}/file/${file}`);
        assert(fs.pathExistsSync(path.resolve(__dirname, `../../../public/assets/test/signatures/${record.id}/file`, file)));
        assert.deepStrictEqual(record.data, data.data);
        assert(record.isValid);
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'canonicalId', 'formId', 'formInstanceId', 'file', 'data']);
        assert.deepStrictEqual(record.updatedDataAttributes, [
          '/eOther.12',
          '/eOther.13',
          '/eOther.15',
          '/eOther.16',
          '/eOther.17',
          '/eOther.20',
          '/eOther.21',
        ]);
        assert.deepStrictEqual(record.createdById, user.id);
        assert.deepStrictEqual(record.updatedById, user.id);
        assert.deepStrictEqual(record.createdByAgencyId, agency.id);
        assert.deepStrictEqual(record.updatedByAgencyId, agency.id);

        const canonical = await record.getCanonical();
        assert(canonical);
        assert.deepStrictEqual(canonical.id, data.canonicalId);
        assert.deepStrictEqual(canonical.parentId, null);
        assert.deepStrictEqual(canonical.canonicalId, null);
        assert.deepStrictEqual(canonical.formId, data.formId);
        assert.deepStrictEqual(canonical.formInstanceId, data.formInstanceId);
        assert.deepStrictEqual(canonical.file, file);
        assert.deepStrictEqual(canonical.fileUrl, `/api/assets/signatures/${record.id}/file/${file}`);
        assert.deepStrictEqual(canonical.data, data.data);
        assert.deepStrictEqual(canonical.createdById, user.id);
        assert.deepStrictEqual(canonical.updatedById, user.id);
        assert.deepStrictEqual(canonical.createdByAgencyId, agency.id);
        assert.deepStrictEqual(canonical.updatedByAgencyId, agency.id);
      });

      it('updates an existing canonical record and creates a corresponding history record', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const data = {
          id: 'e9585827-8d4c-42e1-9847-99d62abd2f75',
          parentId: '62e0590e-dc22-431a-9ef3-30a822cc754b',
          file,
          data_patch: [
            {
              op: 'replace',
              path: '/eOther.15/_text',
              value: '4515031',
            },
            {
              op: 'add',
              path: '/eOther.16',
              value: { _text: file },
            },
            {
              op: 'add',
              path: '/eOther.17',
              value: { _text: 'png' },
            },
          ],
        };
        const [record, created] = await models.Signature.createOrUpdate(user, agency, data);
        assert(record);
        assert(!created);
        assert.deepStrictEqual(record.id, data.id);
        assert.deepStrictEqual(record.parentId, data.parentId);
        const parent = await record.getParent();
        assert.deepStrictEqual(record.canonicalId, parent.canonicalId);
        assert.deepStrictEqual(record.createdById, parent.createdById);
        assert.deepStrictEqual(record.updatedById, user.id);
        assert.deepStrictEqual(record.createdByAgencyId, parent.createdByAgencyId);
        assert.deepStrictEqual(record.updatedByAgencyId, agency.id);
        assert.deepStrictEqual(record.formId, parent.formId);
        assert.deepStrictEqual(record.formInstanceId, parent.formInstanceId);
        assert.deepStrictEqual(record.file, file);
        assert.deepStrictEqual(record.fileUrl, `/api/assets/signatures/${record.id}/file/${file}`);
        assert(fs.pathExistsSync(path.resolve(__dirname, `../../../public/assets/test/signatures/${record.id}/file`, file)));
        assert.deepStrictEqual(record.metadata, data.metadata);
        assert.deepStrictEqual(record.data['eOther.15']._text, '4515031');
        assert.deepStrictEqual(record.data['eOther.16']._text, file);
        assert.deepStrictEqual(record.data['eOther.17']._text, 'png');
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'parentId', 'file', 'data']);
        assert.deepStrictEqual(record.updatedDataAttributes, ['/eOther.15', '/eOther.16', '/eOther.17']);

        const canonical = await record.getCanonical();
        assert.deepStrictEqual(canonical.parentId, null);
        assert.deepStrictEqual(canonical.canonicalId, null);
        assert.deepStrictEqual(canonical.createdById, record.createdById);
        assert.deepStrictEqual(canonical.updatedById, record.updatedById);
        assert.deepStrictEqual(canonical.createdByAgencyId, record.createdByAgencyId);
        assert.deepStrictEqual(canonical.updatedByAgencyId, record.updatedByAgencyId);
        assert.deepStrictEqual(canonical.formId, record.formId);
        assert.deepStrictEqual(canonical.formInstanceId, record.formInstanceId);
        assert.deepStrictEqual(canonical.file, file);
        assert.deepStrictEqual(canonical.fileUrl, `/api/assets/signatures/${record.id}/file/${file}`);
        assert.deepStrictEqual(canonical.data, record.data);
      });
    });
  });
});
