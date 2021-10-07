import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { FacilitiesRoutingModule } from './facilities-routing.module';

import { EditFacilityComponent } from './edit-facility.component';
import { ListFacilitiesComponent } from './list-facilities.component';
import { NewFacilityComponent } from './new-facility.component';

@NgModule({
  declarations: [EditFacilityComponent, ListFacilitiesComponent, NewFacilityComponent],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, FacilitiesRoutingModule],
  providers: [],
})
export class FacilitiesModule {}
