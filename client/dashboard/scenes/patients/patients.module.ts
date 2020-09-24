import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';
import { AgmOverlays } from 'agm-overlays';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

import { SharedComponentsModule } from '../../../shared/components';
import { SharedPipesModule } from '../../../shared/pipes';

import { ComponentsModule } from '../../components/components.module';

import { PatientComponent, PatientRowComponent, ScanPatientComponent } from '.';

@NgModule({
  declarations: [PatientComponent, PatientRowComponent, ScanPatientComponent],
  exports: [PatientRowComponent],
  imports: [
    AgmCoreModule,
    AgmOverlays,
    CommonModule,
    ComponentsModule,
    FormsModule,
    SharedComponentsModule,
    SharedPipesModule,
    ZXingScannerModule,
  ],
  providers: [],
})
export class PatientsModule {}
