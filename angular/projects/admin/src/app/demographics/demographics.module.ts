import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { SchemaModule } from '../schema/schema.module';

import { FormsDemographicsModule } from './forms/forms-demographics.module';
import { VersionsDemographicsModule } from './versions/versions-demographics.module';

import { DemographicsRoutingModule } from './demographics-routing.module';

import { AgencyRecordDemographicsComponent } from './agency-record-demographics.component';
import { BaseDemographicsComponent } from './base-demographics.component';
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
import { ListDemographicsComponent } from './list-demographics.component';
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
    BaseDemographicsComponent,
    ConfigurationsListDemographicsComponent,
    ConfigurationsRecordDemographicsComponent,
    ContactsListDemographicsComponent,
    ContactsRecordDemographicsComponent,
    CustomConfigurationDemographicsComponent,
    CustomResultsDemographicsComponent,
    DashboardDemographicsComponent,
    DevicesListDemographicsComponent,
    DevicesRecordDemographicsComponent,
    FacilityDemographicsComponent,
    ListDemographicsComponent,
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
    SchemaModule,
    SharedModule,
    FormsDemographicsModule,
    VersionsDemographicsModule,
    DemographicsRoutingModule,
  ],
  providers: [],
})
export class DemographicsModule {}
