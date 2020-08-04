import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';
import { AgmOverlays } from 'agm-overlays';

import { SharedComponentsModule } from '../../shared/components';
import { SharedPipesModule } from '../../shared/pipes';

import { ComponentsModule } from '../components/components.module';
import { PatientsModule } from './patients/patients.module';
import { SceneService } from './scene.service';
import { ScenesRoutingModule } from './scenes-routing.module';

import { ListScenesComponent, SceneMapComponent, SceneOverviewComponent, ScenePatientsComponent, SceneSummaryComponent } from '.';

@NgModule({
  declarations: [
    ListScenesComponent,
    SceneMapComponent,
    SceneOverviewComponent,
    ScenePatientsComponent,
    SceneSummaryComponent
  ],
  imports: [
    AgmCoreModule,
    AgmOverlays,
    CommonModule,
    ComponentsModule,
    FormsModule,
    PatientsModule,
    SharedComponentsModule,
    SharedPipesModule,
    ScenesRoutingModule
  ],
  providers: [
    SceneService
  ]
})
export class ScenesModule {}
