const assert = require('assert');
const { StatusCodes } = require('http-status-codes');
const session = require('supertest-session');

require('../helpers');
const app = require('../../app');
const nemsisPublic = require('../../lib/nemsis/public');

describe('/nemsis', () => {
  let testSession;

  before(function anon() {
    // temporarily skip all due to NEMSIS repo issues
    return this.skip();
  });

  describe('GET /public/:nemsisVersion/:xsd', () => {
    it('should return the JSON version of the specified NEMSIS XSD', async () => {
      testSession = session(app);

      await nemsisPublic.pull();
      const repo = nemsisPublic.getNemsisPublicRepo('3.5.0.211008CP3');
      await repo.pull();

      let response;
      // first call will convert to json on the fly
      response = await testSession.get('/nemsis/public/3.5.0.211008CP3/dAgency_v3.xsd').expect(StatusCodes.OK);
      assert.deepStrictEqual(response.body?.['xs:schema']?._attributes?.targetNamespace, 'http://www.nemsis.org');

      // test again, to make sure that serving exiting file works
      response = await testSession.get('/nemsis/public/3.5.0.211008CP3/dAgency_v3.xsd').expect(StatusCodes.OK);
      assert.deepStrictEqual(response.body?.['xs:schema']?._attributes?.targetNamespace, 'http://www.nemsis.org');
    });
  });
});
