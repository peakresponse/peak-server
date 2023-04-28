import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, SchemaService, UserService } from 'shared';

import { AgencyRecordDemographicsComponent } from './agency-record-demographics.component';
import { ConfigurationsListDemographicsComponent } from './configurations-list-demographics.component';
import { ConfigurationsRecordDemographicsComponent } from './configurations-record-demographics.component';
import { ContactsListDemographicsComponent } from './contacts-list-demographics.component';
import { ContactsRecordDemographicsComponent } from './contacts-record-demographics.component';
import { CustomConfigurationDemographicsComponent } from './custom-configuration-demographics.component';
import { CustomResultsDemographicsComponent } from './custom-results-demographics.component';
import { DashboardDemographicsComponent } from './dashboard-demographics.component';
import { DevicesListDemographicsComponent } from './devices-list-demographics.component';
import { DevicesRecordDemographicsComponent } from './devices-record-demographics.component';
import { FacilityDemographicsComponent } from './facility-demographics.component';
import { LocationsListDemographicsComponent } from './locations-list-demographics.component';
import { LocationsRecordDemographicsComponent } from './locations-record-demographics.component';
import { PersonnelListDemographicsComponent } from './personnel-list-demographics.component';
import { PersonnelRecordDemographicsComponent } from './personnel-record-demographics.component';
import { VehiclesListDemographicsComponent } from './vehicles-list-demographics.component';
import { VehiclesRecordDemographicsComponent } from './vehicles-record-demographics.component';

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
        path: 'dashboard',
        component: DashboardDemographicsComponent,
      },
      {
        path: 'agency',
        component: AgencyRecordDemographicsComponent,
      },
      {
        path: 'configurations',
        component: ConfigurationsListDemographicsComponent,
        children: [
          {
            path: ':id',
            component: ConfigurationsRecordDemographicsComponent,
          },
        ],
      },
      {
        path: 'contacts',
        component: ContactsListDemographicsComponent,
        children: [
          {
            path: ':id',
            component: ContactsRecordDemographicsComponent,
          },
        ],
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
        component: DevicesListDemographicsComponent,
        children: [
          {
            path: ':id',
            component: DevicesRecordDemographicsComponent,
          },
        ],
      },
      {
        path: 'facilities',
        component: FacilityDemographicsComponent,
      },
      {
        path: 'locations',
        component: LocationsListDemographicsComponent,
        children: [
          {
            path: ':id',
            component: LocationsRecordDemographicsComponent,
          },
        ],
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
        component: VehiclesListDemographicsComponent,
        children: [
          {
            path: ':id',
            component: VehiclesRecordDemographicsComponent,
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule],
})
export class DemographicsRoutingModule {}
