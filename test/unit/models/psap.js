const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');
const fccMocks = require('../../mocks/fcc');

describe('models', () => {
  describe('Psap', () => {
    describe('importPsapsForState()', () => {
      it('imports PSAP entries from the FCC registry for a given State', async () => {
        await helpers.loadFixtures(['states', 'counties', 'cities']);
        await fccMocks.mockPsapRegistryDownloads();
        await models.Psap.importPsapsForState('06');
        assert.deepStrictEqual(await models.Psap.count(), 598);

        const psap = await models.Psap.findByPk('588');
        assert.deepStrictEqual(psap.name, 'San Francisco Department Of Emergency Management (san Francisco)');
        assert.deepStrictEqual(psap.stateId, '06');
        assert.deepStrictEqual(psap.countyId, '06075');
        assert.deepStrictEqual(psap.cityId, '2411786');
        assert.deepStrictEqual(psap.change, 'M');
        assert.deepStrictEqual(
          psap.comments,
          'PSAP Name, State, County or City text has been modified since the original posting of the FCC Registry.',
        );
        assert.deepStrictEqual(psap.modifiedOn, '2012-10-03');
      });
    });
  });
});
