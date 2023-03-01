import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { SchemaModule } from '../schema/schema.module';

import { FormsDemographicsModule } from './forms/forms-demographics.module';
import { DemographicsRoutingModule } from './demographics-routing.module';

import { AgencyRecordDemographicsComponent } from './agency-record-demographics.component';
import { BaseDemographicsComponent } from './base-demographics.component';
import { ConfigurationDemographicsComponent } from './configuration-demographics.component';
import { ContactDemographicsComponent } from './contact-demographics.component';
import { CustomConfigurationDemographicsComponent } from './custom-configuration-demographics.component';
import { CustomResultsDemographicsComponent } from './custom-results-demographics.component';
import { DashboardDemographicsComponent } from './dashboard-demographics.component';
import { DeviceDemographicsComponent } from './device-demographics.component';
import { FacilityDemographicsComponent } from './facility-demographics.component';
import { ListDemographicsComponent } from './list-demographics.component';
import { LocationDemographicsComponent } from './location-demographics.component';
import { PersonnelBulkInviteDemographicsComponent } from './personnel-bulk-invite-demographics.component';
import { PersonnelListDemographicsComponent } from './personnel-list-demographics.component';
import { PersonnelRecordDemographicsComponent } from './personnel-record-demographics.component';
import { VehiclesListDemographicsComponent } from './vehicles-list-demographics.component';
import { VehiclesRecordDemographicsComponent } from './vehicles-record-demographics.component';

@NgModule({
  declarations: [
    AgencyRecordDemographicsComponent,
    BaseDemographicsComponent,
    ConfigurationDemographicsComponent,
    ContactDemographicsComponent,
    CustomConfigurationDemographicsComponent,
    CustomResultsDemographicsComponent,
    DashboardDemographicsComponent,
    DeviceDemographicsComponent,
    FacilityDemographicsComponent,
    ListDemographicsComponent,
    LocationDemographicsComponent,
    PersonnelBulkInviteDemographicsComponent,
    PersonnelListDemographicsComponent,
    PersonnelRecordDemographicsComponent,
    VehiclesListDemographicsComponent,
    VehiclesRecordDemographicsComponent,
  ],
  imports: [CommonModule, FormsModule, NgbModule, SchemaModule, SharedModule, FormsDemographicsModule, DemographicsRoutingModule],
  providers: [],
})
export class DemographicsModule {}
