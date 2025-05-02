import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { VenueFacilityFormComponent } from './venue-facility-form.component';
import { VenueFormComponent } from './venue-form.component';

@NgModule({
  declarations: [VenueFacilityFormComponent, VenueFormComponent],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule],
  exports: [VenueFacilityFormComponent, VenueFormComponent],
  providers: [],
})
export class VenueModule {}
