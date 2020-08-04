import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedComponentsModule } from '../../shared/components';
import { SharedPipesModule } from '../../shared/pipes';

import { DemographicsRoutingModule } from './demographics-routing.module';
import { AgencyDemographicsComponent, BaseDemographicsComponent,
  ConfigurationDemographicsComponent,
  ContactDemographicsComponent, CustomConfigurationDemographicsComponent,
  CustomResultsDemographicsComponent, DeviceDemographicsComponent,
  FacilityDemographicsComponent, LocationDemographicsComponent,
  PersonnelDemographicsComponent, VehicleDemographicsComponent } from '.';

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
    VehicleDemographicsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    SharedComponentsModule,
    SharedPipesModule,
    DemographicsRoutingModule
  ],
  providers: []
})
export class DemographicsModule {}
