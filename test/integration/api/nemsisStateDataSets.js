const assert = require('assert');
const fs = require('fs-extra');
const HttpStatus = require('http-status-codes');
const { mkdirp } = require('mkdirp');
const path = require('path');
const session = require('supertest-session');
const uuid = require('uuid/v4');

const helpers = require('../../helpers');

const app = require('../../../app');
const models = require('../../../models');

describe('/api/nemsis/state-data-sets', () => {
  let testSession;

  beforeEach(async () => {
    await helpers.loadFixtures([
      'states',
      'counties',
      'cities',
      'users',
      'psaps',
      'nemsisStateDataSets',
      'nemsisSchematrons',
      'agencies',
      'versions',
      'employments',
    ]);
    testSession = session(app);
    await testSession.post('/login').send({ email: 'admin@peakresponse.net', password: 'abcd1234' }).expect(HttpStatus.OK);
  });

  describe('GET /', () => {
    it('returns all configured NEMSIS state data sets', async () => {
      const response = await testSession.get('/api/nemsis/state-data-sets').expect(HttpStatus.OK);
      const data = response.body;
      assert(data);
      assert.deepStrictEqual(data.length, 2);
      assert.deepStrictEqual(data[0].stateId, '06');
      assert.deepStrictEqual(data[1].stateId, '50');
    });

    it('returns configured NEMSIS state data sets for the given state', async () => {
      const response = await testSession.get('/api/nemsis/state-data-sets?stateId=50').expect(HttpStatus.OK);
      const data = response.body;
      assert(data);
      assert.deepStrictEqual(data.length, 1);
      assert.deepStrictEqual(data[0].stateId, '50');
    });
  });

  describe('POST /', () => {
    it('creates a new Nemsis State Data Set record', async () => {
      const response = await testSession
        .post('/api/nemsis/state-data-sets')
        .send({ stateId: '50', version: '2023-02-21-001db2f318b31b46da54fb8891e195df6bb8947c' })
        .expect(HttpStatus.CREATED);
      assert(response.body.id);
      const record = await models.NemsisStateDataSet.findByPk(response.body.id);
      assert.deepStrictEqual(record.stateId, '50');
      assert.deepStrictEqual(record.nemsisVersion, '3.5.0.191130CP1');
      assert.deepStrictEqual(record.version, '2023-02-21-001db2f318b31b46da54fb8891e195df6bb8947c');
      assert.deepStrictEqual(record.createdById, '7f666fe4-dbdd-4c7f-ab44-d9157379a680');
      assert.deepStrictEqual(record.updatedById, '7f666fe4-dbdd-4c7f-ab44-d9157379a680');
    });

    context('external file', () => {
      let file;

      beforeEach(() => {
        file = `${uuid()}.xml`;
        mkdirp.sync(path.resolve(__dirname, '../../../tmp/uploads'));
        fs.copySync(
          path.resolve(__dirname, '../../fixtures/nemsis/full/2023-STATE-1_v350.xml'),
          path.resolve(__dirname, `../../../tmp/uploads/${file}`)
        );
      });

      afterEach(() => {
        fs.removeSync(path.resolve(__dirname, `../../../tmp/uploads/${file}`));
        fs.removeSync(path.resolve(__dirname, `../../../public/assets/test`));
      });

      it('creates a new Nemsis State Data Set record from an external file', async () => {
        const response = await testSession
          .post('/api/nemsis/state-data-sets')
          .send({
            stateId: '05',
            file,
            fileName: '2023-STATE-1_v350.xml',
          })
          .expect(HttpStatus.CREATED);
        assert(response.body.id);
        const record = await models.NemsisStateDataSet.findByPk(response.body.id);
        assert.deepStrictEqual(record.stateId, '05');
        assert.deepStrictEqual(record.nemsisVersion, '3.5.0.211008CP3');
        assert.deepStrictEqual(record.version, null);
        assert.deepStrictEqual(record.fileName, '2023-STATE-1_v350.xml');
        assert.deepStrictEqual(record.createdById, '7f666fe4-dbdd-4c7f-ab44-d9157379a680');
        assert.deepStrictEqual(record.updatedById, '7f666fe4-dbdd-4c7f-ab44-d9157379a680');
        assert(fs.existsSync(path.resolve(__dirname, `../../../public/assets/test/nemsis-state-data-sets/${record.id}/file/${file}`)));
      });

      it('returns unprocessable entity for an external file not matching the specified state', async () => {
        await testSession
          .post('/api/nemsis/state-data-sets')
          .send({
            stateId: '50',
            file,
            fileName: '2023-STATE-1_v350.xml',
          })
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);
      });
    });
  });

  describe('POST /:id/import', () => {
    it('starts importing from the specified NEMSIS State Data Set', async () => {
      let response = await testSession
        .post('/api/nemsis/state-data-sets/1301f4e2-87b9-486a-b3d0-61a46d703b44/import')
        .expect(HttpStatus.OK);
      assert.deepStrictEqual(response.body.status?.code, HttpStatus.ACCEPTED);
      // start polling for completion
      for (;;) {
        // eslint-disable-next-line no-await-in-loop
        response = await testSession.get(`/api/nemsis/state-data-sets/1301f4e2-87b9-486a-b3d0-61a46d703b44`);
        if (response.body.status?.code === HttpStatus.ACCEPTED) {
          // eslint-disable-next-line no-await-in-loop
          await helpers.sleep(250);
        } else {
          assert.deepStrictEqual(response.status, HttpStatus.OK);
          break;
        }
      }
      assert.deepStrictEqual(await models.Agency.count({ where: { stateId: '50' } }), 163);
      assert.deepStrictEqual(await models.Facility.count(), 390);
    });
  });
});
