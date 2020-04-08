import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedComponentsModule } from '../../shared/components';
import { SharedPipesModule } from '../../shared/pipes';

import { FacilitiesRoutingModule } from './facilities-routing.module';
import { EditFacilityComponent, ListFacilitiesComponent, NewFacilityComponent } from '.';

@NgModule({
  declarations: [
    EditFacilityComponent,
    ListFacilitiesComponent,
    NewFacilityComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    SharedComponentsModule,
    SharedPipesModule,
    FacilitiesRoutingModule
  ],
  providers: []
})
export class FacilitiesModule {}
