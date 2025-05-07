import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { VenuesRoutingModule } from './venues-routing.module';

import { EditVenueComponent } from './edit-venue.component';
import { ListVenuesComponent } from './list-venues.component';
import { NewVenueComponent } from './new-venue.component';
import { VenueFacilityFormComponent } from './venue-facility-form.component';
import { VenueFormComponent } from './venue-form.component';

@NgModule({
  declarations: [ListVenuesComponent, NewVenueComponent, EditVenueComponent, VenueFacilityFormComponent, VenueFormComponent],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, VenuesRoutingModule],
  exports: [VenueFacilityFormComponent, VenueFormComponent],
  providers: [],
})
export class VenuesModule {}
