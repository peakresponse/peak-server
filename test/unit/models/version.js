const assert = require('assert');
const { StatusCodes } = require('http-status-codes');

const helpers = require('../../helpers');
const models = require('../../../models');
const nemsisStates = require('../../../lib/nemsis/states');

describe('models', () => {
  describe('Version', () => {
    before(async () => {
      const repo = nemsisStates.getNemsisStateRepo('06', '3.5.0');
      await repo.pull();
      await repo.install('2023-02-17-5d0e21eff095d115b7e58e3fc7c39a040a2a00b4');
    });

    beforeEach(async () => {
      await helpers.loadFixtures([
        'users',
        'states',
        'counties',
        'cities',
        'psaps',
        'nemsisStateDataSets',
        'nemsisSchematrons',
        'regions',
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
        const m = version.demDataSet.match('timeStamp="([^"]+)"');
        assert.deepStrictEqual(
          version.demDataSet,
          `<DEMDataSet xmlns="http://www.nemsis.org" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.nemsis.org https://nemsis.org/media/nemsis_v3/3.5.0.211008CP3/XSDs/NEMSIS_XSDs/DEMDataSet_v3.xsd">
	<dCustomConfiguration>
		<dCustomConfiguration.CustomGroup CustomElementID="dFacility.01">
			<dCustomConfiguration.01 nemsisElement="dFacility.01">Type of Facility</dCustomConfiguration.01>
			<dCustomConfiguration.02>The type of facility (healthcare or other) that the EMS agency transports patients to or from.</dCustomConfiguration.02>
			<dCustomConfiguration.03>9902009</dCustomConfiguration.03>
			<dCustomConfiguration.04>9923001</dCustomConfiguration.04>
			<dCustomConfiguration.05>9903007</dCustomConfiguration.05>
			<dCustomConfiguration.06 nemsisCode="1701009" customValueDescription="Alternate Care Site">1701037</dCustomConfiguration.06>
		</dCustomConfiguration.CustomGroup>
	</dCustomConfiguration>
	<DemographicReport timeStamp="${m[1]}">
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
		</dVehicle>
		<dPersonnel>
			<dPersonnel.PersonnelGroup UUID="0544b426-2969-4f98-a458-e090cd3487e2">
				<dPersonnel.NameGroup>
					<dPersonnel.01>User</dPersonnel.01>
					<dPersonnel.02>Pending</dPersonnel.02>
				</dPersonnel.NameGroup>
				<dPersonnel.10>pending.user@test.com</dPersonnel.10>
			</dPersonnel.PersonnelGroup>
			<dPersonnel.PersonnelGroup UUID="50c06caf-9706-4305-bc3a-5462a7d20b6f">
				<dPersonnel.NameGroup>
					<dPersonnel.01>Member</dPersonnel.01>
					<dPersonnel.02>Invited</dPersonnel.02>
				</dPersonnel.NameGroup>
				<dPersonnel.10>invited.member@peakresponse.net</dPersonnel.10>
			</dPersonnel.PersonnelGroup>
			<dPersonnel.PersonnelGroup UUID="7939c808-820e-42cc-8331-8e31ff951541">
				<dPersonnel.NameGroup>
					<dPersonnel.01>Admin</dPersonnel.01>
					<dPersonnel.02>Personnel</dPersonnel.02>
				</dPersonnel.NameGroup>
				<dPersonnel.10>personnel.admin@peakresponse.net</dPersonnel.10>
				<dPersonnel.33>2020-04-06</dPersonnel.33>
			</dPersonnel.PersonnelGroup>
			<dPersonnel.PersonnelGroup UUID="8abdb57e-cebf-455c-8148-2ef16d383d55">
				<dPersonnel.NameGroup>
					<dPersonnel.01>User</dPersonnel.01>
					<dPersonnel.02>Regular</dPersonnel.02>
				</dPersonnel.NameGroup>
				<dPersonnel.10>regular@peakresponse.net</dPersonnel.10>
				<dPersonnel.33>2020-04-06</dPersonnel.33>
			</dPersonnel.PersonnelGroup>
			<dPersonnel.PersonnelGroup UUID="ab7f0729-0506-4f80-931d-5456a29cacef">
				<dPersonnel.NameGroup>
					<dPersonnel.01>User</dPersonnel.01>
					<dPersonnel.02>Refused</dPersonnel.02>
				</dPersonnel.NameGroup>
				<dPersonnel.10>refused@peakresponse.net</dPersonnel.10>
			</dPersonnel.PersonnelGroup>
			<dPersonnel.PersonnelGroup UUID="b0c2b79e-5905-417f-a790-ba77c1134d92">
				<dPersonnel.NameGroup>
					<dPersonnel.01>User</dPersonnel.01>
					<dPersonnel.02>Ended</dPersonnel.02>
				</dPersonnel.NameGroup>
				<dPersonnel.10>ended@peakresponse.net</dPersonnel.10>
			</dPersonnel.PersonnelGroup>
		</dPersonnel>
	</DemographicReport>
</DEMDataSet>`,
        );
      });
    });

    describe('.nemsisValidate()', () => {
      it('validates the DEM Data Set against NEMSIS XSD and Schematron', async () => {
        const version = await models.Version.findByPk('682d5860-c11e-4a40-bfcc-b2dadec9e7d4');
        await version.regenerate();
        await version.nemsisValidate();
        assert.deepStrictEqual(version.isValid, true);
      });
    });

    describe('.commit()', () => {
      it('applies all draft demographic records and sets the draft version as the new current version', async () => {
        const version = await models.Version.findByPk('682d5860-c11e-4a40-bfcc-b2dadec9e7d4');
        await version.commit();
        assert.deepStrictEqual(version.isDraft, false);
        const agency = await models.Agency.findByPk('9eeb6591-12f8-4036-8af8-6b235153d444');
        assert.deepStrictEqual(agency.versionId, version.id);

        let vehicle = await models.Vehicle.findByPk('e8d22910-7962-48f4-8a04-f511b8bf90dd');
        assert(vehicle.archivedAt);

        vehicle = await models.Vehicle.findByPk('91986460-5a12-426d-9855-93227b47ead5');
        assert.deepStrictEqual(vehicle.number, '55');

        vehicle = await models.Vehicle.findByPk('b94e7f8a-bbed-4630-8b14-2da7945e0ddb');
        assert.deepStrictEqual(vehicle.isDraft, false);
      });
    });

    describe('.startImportDataSet()', () => {
      it('imports an attached DEM data set file', async () => {
        const user = await models.User.findByPk('ffc7a312-50ba-475f-b10f-76ce793dc62a');
        const version = await models.Version.findByPk('9a53c10e-6ade-4c1e-a1b3-464ce4a69719');
        version.file = await helpers.uploadFile('2024-DEM-1_v350.xml');
        await version.save();
        await version.startImportDataSet(user);
        // start polling for completion
        for (;;) {
          // eslint-disable-next-line no-await-in-loop
          await version.reload();
          if (version.status?.code === StatusCodes.ACCEPTED) {
            // eslint-disable-next-line no-await-in-loop
            await helpers.sleep(50);
          } else {
            assert.deepStrictEqual(version.status.code, StatusCodes.OK);
            break;
          }
        }
        const agency = await version.getAgency();
        const draft = await agency.getDraft();
        assert.deepStrictEqual(draft.name, 'UCHealth EMS');
        assert.deepStrictEqual(draft.number, '350-A078');
        assert.deepStrictEqual(draft.stateId, '08');
        assert.deepStrictEqual(draft.stateUniqueId, 'A078');

        const configurations = await models.Configuration.scope('draft').findAll({ where: { createdByAgencyId: agency.id } });
        assert.deepStrictEqual(configurations.length, 2);

        const contacts = await models.Contact.scope('draft').findAll({ where: { createdByAgencyId: agency.id } });
        assert.deepStrictEqual(contacts.length, 2);

        const customConfigurations = await models.CustomConfiguration.scope('draft').findAll({ where: { createdByAgencyId: agency.id } });
        assert.deepStrictEqual(customConfigurations.length, 1);
        assert.deepStrictEqual(customConfigurations[0].customElementId, 'dPersonnel.18');

        const devices = await models.Device.scope('draft').findAll({ where: { createdByAgencyId: agency.id } });
        assert.deepStrictEqual(devices.length, 2);

        const facilities = await models.Facility.scope('draft').findAll({ where: { createdByAgencyId: agency.id } });
        assert.deepStrictEqual(facilities.length, 5);

        const locations = await models.Location.scope('draft').findAll({ where: { createdByAgencyId: agency.id } });
        assert.deepStrictEqual(locations.length, 2);

        const personnel = await models.Employment.scope('draft').findAll({ where: { createdByAgencyId: agency.id } });
        assert.deepStrictEqual(personnel.length, 4);

        const vehicles = await models.Vehicle.scope('draft').findAll({ where: { createdByAgencyId: agency.id } });
        assert.deepStrictEqual(vehicles.length, 2);
      });
    });
  });
});
