'use strict'

const assert = require('assert');
const HttpStatus = require('http-status-codes');
const moment = require('moment');
const session = require('supertest-session');

const helpers = require('../helpers');
const app = require('../../app');
const models = require('../../models');

describe('/login', function() {
  let testSession;

  beforeEach(async function() {
    await helpers.loadFixtures(['users', 'states', 'agencies']);
    testSession = session(app);
  });

  describe('POST /', function() {
    it('should log in a site-admin user to the root domain', async function() {
      await testSession.post('/login')
        .set('Host', process.env.BASE_HOST)
        .send({email: 'admin@peakresponse.net', password: 'abcd1234'})
        .expect(HttpStatus.OK);
    });

    it ('should reject a non-site-admin user on the root domain', async function() {
      await testSession.post('/login')
        .set('Host', process.env.BASE_HOST)
        .send({email: 'regular@peakresponse.net', password: 'abcd1234'})
        .expect(HttpStatus.FORBIDDEN);
    });

    context('for an agency subdomain', function() {
      beforeEach(async function() {
        await helpers.loadFixtures(['demographics/dem-agencies', 'demographics/employments'])
      });

      it('should return not found for invalid subdomain', async function() {
        await testSession.post('/login')
          .set('Host', `notfound.${process.env.BASE_HOST}`)
          .send({email: 'regular@peakresponse.net', password: 'abcd1234'})
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should log in a site-admin user to the agency domain even if not an employee', async function() {
        await testSession.post('/login')
          .set('Host', `bmacc.${process.env.BASE_HOST}`)
          .send({email: 'admin@peakresponse.net', password: 'abcd1234'})
          .expect(HttpStatus.OK);
      });

      it('should log in an employed user to the agency domain', async function() {
        await testSession.post('/login')
          .set('Host', `bmacc.${process.env.BASE_HOST}`)
          .send({email: 'regular@peakresponse.net', password: 'abcd1234'})
          .expect(HttpStatus.OK);
      });

      it ('should reject a formerly employed user on the agency domain', async function() {
        await testSession.post('/login')
          .set('Host', `bmacc.${process.env.BASE_HOST}`)
          .send({email: 'ended@peakresponse.net', password: 'abcd1234'})
          .expect(HttpStatus.FORBIDDEN);
      });

      it ('should reject a non-employed user on the agency domain', async function() {
        await testSession.post('/login')
          .set('Host', `bmacc.${process.env.BASE_HOST}`)
          .send({email: 'another@peakresponse.net', password: 'abcd1234'})
          .expect(HttpStatus.FORBIDDEN);
      });
    });
  });
});
