const assert = require('assert');
const fs = require('fs-extra');
const { StatusCodes } = require('http-status-codes');
const path = require('path');
const session = require('supertest-session');
const { v4: uuidv4 } = require('uuid');

const helpers = require('../../helpers');
const app = require('../../../app');

describe('/api/assets', () => {
  let file;
  let testSession;

  beforeEach(async () => {
    file = `${uuidv4()}.png`;
    await helpers.loadFixtures([
      'states',
      'counties',
      'cities',
      'psaps',
      'users',
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
      .expect(StatusCodes.OK);
  });

  afterEach(() => {
    fs.removeSync(path.resolve(__dirname, `../../../tmp/uploads/${file}`));
  });

  describe('POST /', () => {
    it('returns a signed upload URL', async () => {
      const response = await testSession
        .post('/api/assets')
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .send({
          blob: {
            signed_id: file,
            content_type: 'image/png',
          },
        })
        .expect(StatusCodes.OK);
      const data = response.body;
      assert.deepStrictEqual(data.signed_id, file);
      assert.deepStrictEqual(data.content_type, 'image/png');
      assert(data.direct_upload.url.startsWith(`${process.env.AWS_S3_SIGNER_ENDPOINT}/app/uploads/${file}`));
      assert(data.direct_upload.url.endsWith, 'x-id=PutObject');
      assert.deepStrictEqual(data.direct_upload.headers, {
        'Content-Type': 'image/png',
      });
    });
  });

  describe('PUT /:path', () => {
    it('stores the uploaded file into tmp folder (local only)', async () => {
      await testSession
        .put(`/api/assets/${file}`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .set('Content-Type', 'image/png')
        .send(fs.readFileSync(path.resolve(__dirname, '../../fixtures/files/512x512.png')))
        .expect(StatusCodes.OK);
      assert(fs.pathExistsSync(path.resolve(__dirname, `../../../tmp/uploads`, file)));
    });
  });

  describe('GET /:path', () => {
    it('returns a redirect URL (non-AWS)', async () => {
      const response = await testSession.get(`/api/assets/${file}`).set('Host', `bmacc.${process.env.BASE_HOST}`);
      assert.deepStrictEqual(response.status, StatusCodes.MOVED_TEMPORARILY);
      assert(response.headers.location.startsWith, `${process.env.AWS_S3_SIGNER_ENDPOINT}/app/test/${file}`);
      assert(response.headers.location.endsWith, 'x-id=GetObject');
    });
  });
});
