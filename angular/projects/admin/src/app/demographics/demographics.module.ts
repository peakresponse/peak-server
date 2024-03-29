import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { FormsDemographicsModule } from './forms/forms-demographics.module';
import { VersionsDemographicsModule } from './versions/versions-demographics.module';

import { DemographicsRoutingModule } from './demographics-routing.module';

import { AgencyRecordDemographicsComponent } from './agency-record-demographics.component';
import { ConfigurationsListDemographicsComponent } from './configurations-list-demographics.component';
import { ConfigurationsRecordDemographicsComponent } from './configurations-record-demographics.component';
import { ContactsListDemographicsComponent } from './contacts-list-demographics.component';
import { ContactsRecordDemographicsComponent } from './contacts-record-demographics.component';
import { CustomConfigurationsListDemographicsComponent } from './custom-configurations-list-demographics.component';
import { CustomConfigurationsRecordDemographicsComponent } from './custom-configurations-record-demographics.component';
import { DashboardDemographicsComponent } from './dashboard-demographics.component';
import { DevicesListDemographicsComponent } from './devices-list-demographics.component';
import { DevicesRecordDemographicsComponent } from './devices-record-demographics.component';
import { FacilitiesListDemographicsComponent } from './facilities-list-demographics.component';
import { FacilitiesRecordDemographicsComponent } from './facilities-record-demographics.component';
import { LocationsListDemographicsComponent } from './locations-list-demographics.component';
import { LocationsRecordDemographicsComponent } from './locations-record-demographics.component';
import { PersonnelBulkInviteDemographicsComponent } from './personnel-bulk-invite-demographics.component';
import { PersonnelListDemographicsComponent } from './personnel-list-demographics.component';
import { PersonnelRecordDemographicsComponent } from './personnel-record-demographics.component';
import { VehiclesListDemographicsComponent } from './vehicles-list-demographics.component';
import { VehiclesRecordDemographicsComponent } from './vehicles-record-demographics.component';

@NgModule({
  declarations: [
    AgencyRecordDemographicsComponent,
    ConfigurationsListDemographicsComponent,
    ConfigurationsRecordDemographicsComponent,
    ContactsListDemographicsComponent,
    ContactsRecordDemographicsComponent,
    CustomConfigurationsListDemographicsComponent,
    CustomConfigurationsRecordDemographicsComponent,
    DashboardDemographicsComponent,
    DevicesListDemographicsComponent,
    DevicesRecordDemographicsComponent,
    FacilitiesListDemographicsComponent,
    FacilitiesRecordDemographicsComponent,
    LocationsListDemographicsComponent,
    LocationsRecordDemographicsComponent,
    PersonnelBulkInviteDemographicsComponent,
    PersonnelListDemographicsComponent,
    PersonnelRecordDemographicsComponent,
    VehiclesListDemographicsComponent,
    VehiclesRecordDemographicsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    SharedModule,
    FormsDemographicsModule,
    VersionsDemographicsModule,
    DemographicsRoutingModule,
  ],
  providers: [],
})
export class DemographicsModule {}
