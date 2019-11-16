import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    CommonModule,
    FormsModule,
    SharedComponentsModule,
    SharedPipesModule,
    PatientsRoutingModule
  ],
  providers: []
})
export class PatientsModule {}
