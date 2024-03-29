const assert = require('assert');
const fs = require('fs/promises');
const _ = require('lodash');
const path = require('path');
const tmp = require('tmp-promise');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('File', () => {
    let file;
    beforeEach(async () => {
      await helpers.loadFixtures([
        'states',
        'counties',
        'cities',
        'users',
        'psaps',
        'nemsisStateDataSets',
        'nemsisSchematrons',
        'regions',
        'agencies',
        'versions',
        'employments',
        'files',
      ]);
      file = await helpers.uploadFile('512x512.png');
    });

    afterEach(async () => {
      await helpers.cleanUploadedAssets();
    });

    describe('createOrUpdate()', () => {
      it('creates a new canonical and corresponding history record', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        const data = {
          id: '69c89deb-7d92-4a8a-a006-715fed6c0111',
          canonicalId: 'd6b2c70c-8d42-4263-80d5-35637a28cd99',
          file,
          metadata: {
            other: 'arbitrary data',
          },
          data: {
            'eOther.09': {
              _text: '4509021',
            },
            'eOther.10': {
              _text: 'png',
            },
          },
        };
        const [record, created] = await models.File.createOrUpdate(user, agency, _.cloneDeep(data));
        assert(record);
        assert(created);
        assert.deepStrictEqual(record.id, data.id);
        assert.deepStrictEqual(record.parentId, null);
        assert.deepStrictEqual(record.canonicalId, data.canonicalId);
        assert.deepStrictEqual(record.file, file);
        assert.deepStrictEqual(record.fileUrl, `/api/assets/files/${record.id}/file/${file}`);
        assert(await helpers.assetPathExists(path.join('files', record.id, 'file', file)));
        assert.deepStrictEqual(record.metadata, data.metadata);
        assert.deepStrictEqual(record.data, data.data);
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'canonicalId', 'file', 'metadata', 'data']);
        assert.deepStrictEqual(record.updatedDataAttributes, ['/eOther.09', '/eOther.10']);
        assert.deepStrictEqual(record.createdById, user.id);
        assert.deepStrictEqual(record.updatedById, user.id);
        assert.deepStrictEqual(record.createdByAgencyId, agency.id);
        assert.deepStrictEqual(record.updatedByAgencyId, agency.id);

        const canonical = await record.getCanonical();
        assert(canonical);
        assert.deepStrictEqual(canonical.id, data.canonicalId);
        assert.deepStrictEqual(canonical.parentId, null);
        assert.deepStrictEqual(canonical.canonicalId, null);
        assert.deepStrictEqual(canonical.file, file);
        assert.deepStrictEqual(canonical.fileUrl, `/api/assets/files/${record.id}/file/${file}`);
        assert.deepStrictEqual(canonical.metadata, data.metadata);
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
          id: 'e65c28ff-c5b7-43e0-971c-91e3f4e35c9e',
          parentId: '7b6ea987-3aee-489a-b2ad-eb455204b5f0',
          file,
          metadata: {
            new: 'metadata',
          },
          data_patch: [
            {
              op: 'replace',
              path: '/eOther.09/_text',
              value: '4509015',
            },
          ],
        };
        const [record, created] = await models.File.createOrUpdate(user, agency, data);
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
        assert.deepStrictEqual(record.file, file);
        assert.deepStrictEqual(record.fileUrl, `/api/assets/files/${record.id}/file/${file}`);
        assert(await helpers.assetPathExists(path.join('files', record.id, 'file', file)));
        assert.deepStrictEqual(record.metadata, data.metadata);
        assert.deepStrictEqual(record.data['eOther.09']._text, '4509015');
        assert.deepStrictEqual(record.updatedAttributes, ['id', 'parentId', 'file', 'metadata', 'data']);
        assert.deepStrictEqual(record.updatedDataAttributes, ['/eOther.09']);

        const canonical = await record.getCanonical();
        assert.deepStrictEqual(canonical.parentId, null);
        assert.deepStrictEqual(canonical.canonicalId, null);
        assert.deepStrictEqual(canonical.createdById, record.createdById);
        assert.deepStrictEqual(canonical.updatedById, record.updatedById);
        assert.deepStrictEqual(canonical.createdByAgencyId, record.createdByAgencyId);
        assert.deepStrictEqual(canonical.updatedByAgencyId, record.updatedByAgencyId);
        assert.deepStrictEqual(canonical.file, file);
        assert.deepStrictEqual(canonical.fileUrl, `/api/assets/files/${record.id}/file/${file}`);
        assert.deepStrictEqual(canonical.metadata, data.metadata);
        assert.deepStrictEqual(canonical.data, record.data);
      });
    });

    describe('.getData()', () => {
      it('returns the data with the file attachment info placeholders', async () => {
        const version = await models.Version.findByPk('c680282e-8756-4b02-82f3-2437c22ecade');
        const record = await models.File.findByPk('8e693fb6-7f2a-4cc8-9d5f-d8eb5915bb60');
        await record.update({ file });
        assert(await helpers.assetPathExists(path.join('files', record.id, 'file', file)));
        const data = await record.getData(version);
        assert.deepStrictEqual(data, {
          'eOther.09': {
            _text: '4509001',
          },
          'eOther.10': {
            _text: 'mp4',
          },
          'eOther.11': {
            _text: '8e693fb67f2a4cc89d5fd8eb5915bb60',
          },
          'eOther.22': {
            _text: file,
          },
        });
      });
    });

    describe('.insertFileInto()', () => {
      it('inserts base64 encoded data into the specified XML file', async () => {
        const record = await models.File.findByPk('8e693fb6-7f2a-4cc8-9d5f-d8eb5915bb60');
        await record.update({ file });
        const tmpFile = await tmp.file();
        try {
          await fs.copyFile(path.resolve(__dirname, '../../fixtures/files/4a7b8b77-b7c2-4338-8508-eeb98fb8d3ed.before.xml'), tmpFile.path);
          await record.insertFileInto(tmpFile.path);
          const test = await fs.readFile(tmpFile.path);
          const compare = await fs.readFile(path.resolve(__dirname, '../../fixtures/files/4a7b8b77-b7c2-4338-8508-eeb98fb8d3ed.after.xml'));
          assert(test.equals(compare));
        } finally {
          await tmpFile.cleanup();
        }
      });
    });
  });
});
