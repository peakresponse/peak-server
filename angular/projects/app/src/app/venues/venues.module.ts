import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { VenueFormComponent } from './venue-form.component';

@NgModule({
  declarations: [VenueFormComponent],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule],
  exports: [VenueFormComponent],
  providers: [],
})
export class VenueModule {}
