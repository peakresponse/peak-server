import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';
import { AgmOverlays } from 'agm-overlays';

import { SharedComponentsModule } from '../../../shared/components';
import { SharedPipesModule } from '../../../shared/pipes';

import { ComponentsModule } from '../../components/components.module';

import { PatientComponent } from './patient.component';

@NgModule({
  declarations: [
    PatientComponent
  ],
  imports: [
    AgmCoreModule,
    AgmOverlays,
    CommonModule,
    ComponentsModule,
    FormsModule,
    SharedComponentsModule,
    SharedPipesModule
  ],
  providers: []
})
export class PatientsModule {}
