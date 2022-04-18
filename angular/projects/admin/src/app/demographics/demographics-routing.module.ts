import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, SchemaService, UserService } from 'shared';

import { AgencyDemographicsComponent } from './agency-demographics.component';
import { ConfigurationDemographicsComponent } from './configuration-demographics.component';
import { ContactDemographicsComponent } from './contact-demographics.component';
import { CustomConfigurationDemographicsComponent } from './custom-configuration-demographics.component';
import { CustomResultsDemographicsComponent } from './custom-results-demographics.component';
import { DeviceDemographicsComponent } from './device-demographics.component';
import { FacilityDemographicsComponent } from './facility-demographics.component';
import { LocationDemographicsComponent } from './location-demographics.component';
import { PersonnelListDemographicsComponent } from './personnel-list-demographics.component';
import { PersonnelRecordDemographicsComponent } from './personnel-record-demographics.component';
import { VehicleDemographicsComponent } from './vehicle-demographics.component';

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
        component: PersonnelListDemographicsComponent,
        children: [
          {
            path: ':id',
            component: PersonnelRecordDemographicsComponent,
          },
        ],
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
