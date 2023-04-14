const assert = require('assert');
const fs = require('fs-extra');
const HttpStatus = require('http-status-codes');
const path = require('path');
const session = require('supertest-session');
const uuid = require('uuid/v4');

const helpers = require('../../helpers');
const app = require('../../../app');

describe('/api/assets', () => {
  let file;
  let testSession;

  beforeEach(async () => {
    file = `${uuid()}.png`;
    await helpers.loadFixtures([
      'states',
      'counties',
      'cities',
      'psaps',
      'users',
      'nemsisStateDataSets',
      'agencies',
      'versions',
      'employments',
    ]);
    testSession = session(app);
    await testSession
      .post('/login')
      .set('Host', `bmacc.${process.env.BASE_HOST}`)
      .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
      .expect(HttpStatus.OK);
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
        .expect(HttpStatus.OK);
      const data = response.body;
      assert.deepStrictEqual(data.signed_id, file);
      assert.deepStrictEqual(data.content_type, 'image/png');
      assert.deepStrictEqual(data.direct_upload, {
        url: `/api/assets/${file}`,
        headers: {
          'Content-Type': 'image/png',
        },
      });
    });
  });

  describe('PUT /:path', () => {
    it('stores the uploaded file into tmp folder (non-AWS)', async () => {
      await testSession
        .put(`/api/assets/${file}`)
        .set('Host', `bmacc.${process.env.BASE_HOST}`)
        .set('Content-Type', 'image/png')
        .send(fs.readFileSync(path.resolve(__dirname, '../../fixtures/files/512x512.png')))
        .expect(HttpStatus.OK);
      assert(fs.pathExistsSync(path.resolve(__dirname, `../../../tmp/uploads`, file)));
    });
  });

  describe('GET /:path', () => {
    it('returns a redirect URL (non-AWS)', async () => {
      const response = await testSession.get(`/api/assets/${file}`).set('Host', `bmacc.${process.env.BASE_HOST}`);
      // .expect(HttpStatus.FOUND);
      assert.deepStrictEqual(response.headers.location, `/assets/test/${file}`);
    });
  });
});
