import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, SchemaService, UserService } from '../../shared/services';

import {
  AgencyDemographicsComponent,
  ConfigurationDemographicsComponent,
  ContactDemographicsComponent,
  CustomConfigurationDemographicsComponent,
  CustomResultsDemographicsComponent,
  DeviceDemographicsComponent,
  FacilityDemographicsComponent,
  LocationDemographicsComponent,
  PersonnelDemographicsComponent,
  VehicleDemographicsComponent,
} from '.';

const appRoutes: Routes = [
  {
    path: 'demographics',
    resolve: {
      agency: AgencyService,
      user: UserService,
      schema: SchemaService,
    },
    children: [
      {
        path: 'agency',
        component: AgencyDemographicsComponent,
      },
      {
        path: 'configuration',
        component: ConfigurationDemographicsComponent,
      },
      {
        path: 'contacts',
        component: ContactDemographicsComponent,
      },
      {
        path: 'custom-configuration',
        component: CustomConfigurationDemographicsComponent,
      },
      {
        path: 'custom-results',
        component: CustomResultsDemographicsComponent,
      },
      {
        path: 'devices',
        component: DeviceDemographicsComponent,
      },
      {
        path: 'facilities',
        component: FacilityDemographicsComponent,
      },
      {
        path: 'locations',
        component: LocationDemographicsComponent,
      },
      {
        path: 'personnel',
        component: PersonnelDemographicsComponent,
      },
      {
        path: 'vehicles',
        component: VehicleDemographicsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule],
})
export class DemographicsRoutingModule {}
