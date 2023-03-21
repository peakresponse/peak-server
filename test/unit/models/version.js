const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Version', () => {
    beforeEach(async () => {
      await helpers.loadFixtures(['users', 'states', 'counties', 'cities', 'psaps', 'agencies', 'versions', 'employments']);
    });

    describe('.name', () => {
      it('returns a unique display name that includes its creation date', async () => {
        const version = await models.Version.findByPk('c680282e-8756-4b02-82f3-2437c22ecade');
        assert.deepStrictEqual(version.name, '2020-04-06-c680282e87564b0282f32437c22ecade');
      });
    });

    describe('.regenerate()', () => {
      it('regenerates the DEMDataSet xml', async () => {
        const version = await models.Version.findByPk('c680282e-8756-4b02-82f3-2437c22ecade');
        await version.regenerate();
        assert.deepStrictEqual(
          version.demDataSet,
          `<DEMDataSet xmlns="http://www.nemsis.org" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.nemsis.org https://nemsis.org/media/nemsis_v3/3.5.0.211008CP3/XSDs/NEMSIS_XSDs/DEMDataSet_v3.xsd">
	<DemographicReport>
		<dAgency>
			<dAgency.01>S07-50120</dAgency.01>
			<dAgency.02>S07-50120</dAgency.02>
			<dAgency.03>Bay Medic Ambulance - Contra Costa</dAgency.03>
			<dAgency.04>06</dAgency.04>
		</dAgency>
	</DemographicReport>
</DEMDataSet>`
        );
      });
    });
  });
});
