import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';
import { VenueModule } from '../venues/venues.module';

import { EventsRoutingModule } from './events-routing.module';

import { EventFormComponent } from './event-form.component';
import { ListEventsComponent } from './list-events.component';
import { NewEventComponent } from './new-event.component';

@NgModule({
  declarations: [EventFormComponent, ListEventsComponent, NewEventComponent],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, VenueModule, EventsRoutingModule],
  providers: [],
})
export class EventsModule {}
