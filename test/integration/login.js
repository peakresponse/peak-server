const assert = require('assert');
const HttpStatus = require('http-status-codes');
const session = require('supertest-session');

const helpers = require('../helpers');
const app = require('../../app');

describe('/login', () => {
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
  });

  describe('POST /', () => {
    it('should log in a site-admin user to the root domain', async () => {
      await testSession
        .post('/login')
        .set('Host', process.env.BASE_HOST)
        .send({ email: 'admin@peakresponse.net', password: 'abcd1234' })
        .expect(HttpStatus.OK);
    });

    it('should return agency information to a non-site-admin user on the root domain', async () => {
      const response = await testSession
        .post('/login')
        .set('Host', process.env.BASE_HOST)
        .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
        .expect(HttpStatus.OK);
      assert(response.body?.agencies?.length, 1);
      const agency = response.body.agencies[0];
      assert(agency.subdomain, 'bmacc');
    });

    context('for an agency subdomain', () => {
      it('should return not found for invalid subdomain', async () => {
        await testSession
          .post('/login')
          .set('Host', `notfound.${process.env.BASE_HOST}`)
          .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should log in a site-admin user to the agency domain even if not an employee', async () => {
        await testSession
          .post('/login')
          .set('Host', `bmacc.${process.env.BASE_HOST}`)
          .send({ email: 'admin@peakresponse.net', password: 'abcd1234' })
          .expect(HttpStatus.OK);
      });

      it('should log in an employed user to the agency domain', async () => {
        await testSession
          .post('/login')
          .set('Host', `bmacc.${process.env.BASE_HOST}`)
          .send({ email: 'regular@peakresponse.net', password: 'abcd1234' })
          .expect(HttpStatus.OK);
      });

      it('should reject a formerly employed user on the agency domain', async () => {
        await testSession
          .post('/login')
          .set('Host', `bmacc.${process.env.BASE_HOST}`)
          .send({ email: 'ended@peakresponse.net', password: 'abcd1234' })
          .expect(HttpStatus.FORBIDDEN);
      });

      it('should reject a non-employed user on the agency domain', async () => {
        await testSession
          .post('/login')
          .set('Host', `bmacc.${process.env.BASE_HOST}`)
          .send({
            email: 'noemployments@peakresponse.net',
            password: 'abcd1234',
          })
          .expect(HttpStatus.FORBIDDEN);
      });
    });
  });
});
