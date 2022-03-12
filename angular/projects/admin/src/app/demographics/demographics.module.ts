import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { DemographicsRoutingModule } from './demographics-routing.module';

import { AgencyDemographicsComponent } from './agency-demographics.component';
import { BaseDemographicsComponent } from './base-demographics.component';
import { ConfigurationDemographicsComponent } from './configuration-demographics.component';
import { ContactDemographicsComponent } from './contact-demographics.component';
import { CustomConfigurationDemographicsComponent } from './custom-configuration-demographics.component';
import { CustomResultsDemographicsComponent } from './custom-results-demographics.component';
import { DeviceDemographicsComponent } from './device-demographics.component';
import { FacilityDemographicsComponent } from './facility-demographics.component';
import { LocationDemographicsComponent } from './location-demographics.component';
import { PersonnelDemographicsComponent } from './personnel-demographics.component';
import { VehicleDemographicsComponent } from './vehicle-demographics.component';

@NgModule({
  declarations: [
    AgencyDemographicsComponent,
    BaseDemographicsComponent,
    ConfigurationDemographicsComponent,
    ContactDemographicsComponent,
    CustomConfigurationDemographicsComponent,
    CustomResultsDemographicsComponent,
    DeviceDemographicsComponent,
    FacilityDemographicsComponent,
    LocationDemographicsComponent,
    PersonnelDemographicsComponent,
    VehicleDemographicsComponent,
  ],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, DemographicsRoutingModule],
  providers: [],
})
export class DemographicsModule {}
