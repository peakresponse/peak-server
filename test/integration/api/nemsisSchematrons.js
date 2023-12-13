const assert = require('assert');
const HttpStatus = require('http-status-codes');
const path = require('path');
const session = require('supertest-session');

const helpers = require('../../helpers');

const app = require('../../../app');
const models = require('../../../models');

describe('/api/nemsis/schematrons', () => {
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
    it('returns all configured NEMSIS schematrons', async () => {
      const response = await testSession.get('/api/nemsis/schematrons').expect(HttpStatus.OK);
      const data = response.body;
      assert(data);
      assert.deepStrictEqual(data.length, 2);
      assert.deepStrictEqual(data[0].stateId, '06');
    });

    it('returns configured NEMSIS schematrons for the given state', async () => {
      let response = await testSession.get('/api/nemsis/schematrons?stateId=06').expect(HttpStatus.OK);
      let data = response.body;
      assert(data);
      assert.deepStrictEqual(data.length, 1);
      assert.deepStrictEqual(data[0].stateId, '06');

      response = await testSession.get('/api/nemsis/schematrons?stateId=50').expect(HttpStatus.OK);
      data = response.body;
      assert(data);
      assert.deepStrictEqual(data.length, 0);
    });
  });

  describe('POST /', () => {
    it('creates a new Nemsis Schematron record', async () => {
      const response = await testSession
        .post('/api/nemsis/schematrons')
        .send({ stateId: '50', dataSet: 'EMSDataSet', version: '2023-04-11-9574129ba2069ced561b85b18ad04d9f18855576' })
        .expect(HttpStatus.CREATED);
      assert(response.body.id);
      const record = await models.NemsisSchematron.findByPk(response.body.id);
      assert.deepStrictEqual(record.stateId, '50');
      assert.deepStrictEqual(record.dataSet, 'EMSDataSet');
      assert.deepStrictEqual(record.nemsisVersion, '3.5.0.211008CP3');
      assert.deepStrictEqual(record.version, '2023-04-11-9574129ba2069ced561b85b18ad04d9f18855576');
      assert.deepStrictEqual(record.createdById, '7f666fe4-dbdd-4c7f-ab44-d9157379a680');
      assert.deepStrictEqual(record.updatedById, '7f666fe4-dbdd-4c7f-ab44-d9157379a680');
    });

    context('external file', () => {
      let file;

      beforeEach(async () => {
        file = await helpers.uploadFile('DEMDataSet.sch');
      });

      afterEach(async () => {
        await helpers.cleanUploadedAssets();
      });

      it('creates a new Nemsis State Data Set record from an external file', async () => {
        const response = await testSession
          .post('/api/nemsis/schematrons')
          .send({
            stateId: '05',
            dataSet: 'DEMDataSet',
            file,
            fileName: 'DEMDataSet.sch',
          })
          .expect(HttpStatus.CREATED);
        assert(response.body.id);
        const record = await models.NemsisSchematron.findByPk(response.body.id);
        assert.deepStrictEqual(record.stateId, '05');
        assert.deepStrictEqual(record.nemsisVersion, '3.5.0.211008CP3');
        assert.deepStrictEqual(record.version, null);
        assert.deepStrictEqual(record.fileName, 'DEMDataSet.sch');
        assert.deepStrictEqual(record.fileVersion, 'compliance_pre_2023');
        assert.deepStrictEqual(record.createdById, '7f666fe4-dbdd-4c7f-ab44-d9157379a680');
        assert.deepStrictEqual(record.updatedById, '7f666fe4-dbdd-4c7f-ab44-d9157379a680');
        assert(await helpers.assetPathExists(path.join('nemsis-schematrons', record.id, 'file', file)));
      });

      it('returns unprocessable entity for an external file not matching the specified data set type', async () => {
        await testSession
          .post('/api/nemsis/schematrons')
          .send({
            stateId: '05',
            dataSet: 'EMSDataSet',
            file,
            fileName: 'DEMDataSet.sch',
          })
          .expect(HttpStatus.UNPROCESSABLE_ENTITY);
      });
    });
  });
});
