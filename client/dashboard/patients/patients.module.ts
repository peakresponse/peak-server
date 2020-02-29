import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';

import { SharedComponentsModule } from '../../shared/components';
import { SharedPipesModule } from '../../shared/pipes';

import { PatientsRoutingModule } from './patients-routing.module';
import { ListPatientsComponent, PatientComponent, ShowPatientComponent } from '.';

@NgModule({
  declarations: [
    ListPatientsComponent,
    PatientComponent,
    ShowPatientComponent
  ],
  imports: [
    AgmCoreModule,
    CommonModule,
    FormsModule,
    SharedComponentsModule,
    SharedPipesModule,
    PatientsRoutingModule
  ],
  providers: []
})
export class PatientsModule {}
