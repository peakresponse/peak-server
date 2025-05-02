import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';
import { VenueModule } from '../venues/venues.module';

import { EventsRoutingModule } from './events-routing.module';

import { EditEventComponent } from './edit-event.component';
import { EventFormComponent } from './event-form.component';
import { ListEventsComponent } from './list-events.component';
import { NewEventComponent } from './new-event.component';
import { EventIncidentsComponent } from './event-incidents.component';

@NgModule({
  declarations: [EditEventComponent, EventFormComponent, ListEventsComponent, NewEventComponent, EventIncidentsComponent],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, VenueModule, EventsRoutingModule],
  providers: [],
})
export class EventsModule {}
