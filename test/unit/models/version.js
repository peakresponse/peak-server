const assert = require('assert');

const helpers = require('../../helpers');
const models = require('../../../models');

describe('models', () => {
  describe('Version', () => {
    beforeEach(async () => {
      await helpers.loadFixtures([
        'users',
        'states',
        'counties',
        'cities',
        'psaps',
        'nemsisStateDataSets',
        'agencies',
        'configurations',
        'versions',
        'employments',
        'vehicles',
      ]);
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
        assert(
          version.demDataSet.match(
            `<DEMDataSet xmlns="http://www.nemsis.org" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.nemsis.org https://nemsis.org/media/nemsis_v3/3.5.0.211008CP3/XSDs/NEMSIS_XSDs/DEMDataSet_v3.xsd">
	<DemographicReport timeStamp="[^"]+">
		<dAgency>
			<dAgency.01>S07-50120</dAgency.01>
			<dAgency.02>S07-50120</dAgency.02>
			<dAgency.03>Bay Medic Ambulance - Contra Costa</dAgency.03>
			<dAgency.04>06</dAgency.04>
			<dAgency.AgencyServiceGroup UUID="da8710d1-e852-4713-9349-8673a5e3ea75">
				<dAgency.05>06</dAgency.05>
				<dAgency.06>06013</dAgency.06>
				<dAgency.07 NV="7701003" xsi:nil="true"/>
				<dAgency.08 NV="7701003" xsi:nil="true"/>
			</dAgency.AgencyServiceGroup>
			<dAgency.09>9920001</dAgency.09>
			<dAgency.11>9917005</dAgency.11>
			<dAgency.12>1016003</dAgency.12>
			<dAgency.13>9912007</dAgency.13>
			<dAgency.14>1018001</dAgency.14>
			<dAgency.25 NV="7701003" xsi:nil="true"/>
			<dAgency.26 NV="7701003" xsi:nil="true"/>
		</dAgency>
		<dConfiguration>
			<dConfiguration.ConfigurationGroup UUID="d662a34d-b8e0-4b3a-95c6-2091735ffa43">
				<dConfiguration.01>06</dConfiguration.01>
				<dConfiguration.ProcedureGroup UUID="bbfd13e3-a63f-4d55-b40e-35eb701ceb83">
					<dConfiguration.06>9917005</dConfiguration.06>
					<dConfiguration.07>33747003</dConfiguration.07>
					<dConfiguration.07>386493006</dConfiguration.07>
					<dConfiguration.07>673005</dConfiguration.07>
					<dConfiguration.07>56251003</dConfiguration.07>
					<dConfiguration.07>398176008</dConfiguration.07>
					<dConfiguration.07>225285007</dConfiguration.07>
					<dConfiguration.07>241689008</dConfiguration.07>
					<dConfiguration.07>81295004</dConfiguration.07>
					<dConfiguration.07>226005007</dConfiguration.07>
					<dConfiguration.07>86265008</dConfiguration.07>
				</dConfiguration.ProcedureGroup>
				<dConfiguration.MedicationGroup UUID="6f7b2fef-8509-4cca-8ad0-860984d2ce5f">
					<dConfiguration.08>9917005</dConfiguration.08>
					<dConfiguration.09 CodeType="9924003">197587</dConfiguration.09>
					<dConfiguration.09 CodeType="9924005">180208003</dConfiguration.09>
					<dConfiguration.09 CodeType="9924005">116861002</dConfiguration.09>
					<dConfiguration.09 CodeType="9924005">116865006</dConfiguration.09>
					<dConfiguration.09 CodeType="9924005">33389009</dConfiguration.09>
					<dConfiguration.09 CodeType="9924005">116762002</dConfiguration.09>
					<dConfiguration.09 CodeType="9924005">116795008</dConfiguration.09>
					<dConfiguration.09 CodeType="9924005">71493000</dConfiguration.09>
				</dConfiguration.MedicationGroup>
				<dConfiguration.10>9914083</dConfiguration.10>
				<dConfiguration.10>9914075</dConfiguration.10>
				<dConfiguration.10>9914001</dConfiguration.10>
				<dConfiguration.10>9914083</dConfiguration.10>
				<dConfiguration.10>9914003</dConfiguration.10>
				<dConfiguration.10>9914005</dConfiguration.10>
				<dConfiguration.10>9914007</dConfiguration.10>
				<dConfiguration.10>9914009</dConfiguration.10>
				<dConfiguration.10>9914055</dConfiguration.10>
				<dConfiguration.10>9914011</dConfiguration.10>
				<dConfiguration.13>1213003</dConfiguration.13>
				<dConfiguration.16>43</dConfiguration.16>
				<dConfiguration.16>50</dConfiguration.16>
				<dConfiguration.16>55</dConfiguration.16>
				<dConfiguration.16>88</dConfiguration.16>
				<dConfiguration.16>92</dConfiguration.16>
			</dConfiguration.ConfigurationGroup>
		</dConfiguration>
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
          )
        );
      });
    });

    describe('.nemsisValidate()', () => {
      it('validates the DEM Data Set against NEMSIS XSD and Schematron', async () => {
        const version = await models.Version.findByPk('682d5860-c11e-4a40-bfcc-b2dadec9e7d4');
        await version.regenerate();
        const result = await version.nemsisValidate();
        assert.deepStrictEqual(result, null);
      });
    });
  });
});
