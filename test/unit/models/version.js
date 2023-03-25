const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Version', () => {
    beforeEach(async () => {
      await helpers.loadFixtures(['users', 'states', 'counties', 'cities', 'psaps', 'agencies', 'versions', 'employments', 'vehicles']);
    });

    describe('.name', () => {
      it('returns a unique display name that includes its creation date', async () => {
        const version = await models.Version.findByPk('c680282e-8756-4b02-82f3-2437c22ecade');
        assert.deepStrictEqual(version.name, '2020-04-06-c680282e87564b0282f32437c22ecade');
      });
    });

    describe('.regenerate()', () => {
      it('regenerates the DEMDataSet xml', async () => {
        const version = await models.Version.findByPk('682d5860-c11e-4a40-bfcc-b2dadec9e7d4');
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
		<dConfiguration></dConfiguration>
		<dVehicle>
			<dVehicle.VehicleGroup UUID="4d71fd4a-ef2b-4a0c-aa11-214b5f54f8f7">
				<dVehicle.01>88</dVehicle.01>
				<dVehicle.02>JN1HS36P2LW140218</dVehicle.02>
				<dVehicle.03>88</dVehicle.03>
				<dVehicle.04>1404001</dVehicle.04>
			</dVehicle.VehicleGroup>
			<dVehicle.VehicleGroup UUID="91986460-5a12-426d-9855-93227b47ead5">
				<dVehicle.01>55</dVehicle.01>
				<dVehicle.02>JH4DA9380PS016488</dVehicle.02>
				<dVehicle.03>55</dVehicle.03>
				<dVehicle.04>1404001</dVehicle.04>
			</dVehicle.VehicleGroup>
			<dVehicle.VehicleGroup UUID="b94e7f8a-bbed-4630-8b14-2da7945e0ddb">
				<dVehicle.01>92</dVehicle.01>
				<dVehicle.02>ZAMGJ45A480037578</dVehicle.02>
				<dVehicle.03>92</dVehicle.03>
				<dVehicle.04>1404001</dVehicle.04>
			</dVehicle.VehicleGroup>
			<dVehicle.VehicleGroup UUID="e8d22910-7962-48f4-8a04-f511b8bf90dd">
				<dVehicle.01>43</dVehicle.01>
				<dVehicle.02>1XPWDBTX48D766660</dVehicle.02>
				<dVehicle.03>43</dVehicle.03>
				<dVehicle.04>1404001</dVehicle.04>
			</dVehicle.VehicleGroup>
		</dVehicle>
	</DemographicReport>
</DEMDataSet>`
        );
      });
    });
  });
});
