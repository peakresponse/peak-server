import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { EventsRoutingModule } from './events-routing.module';

import { ListEventsComponent } from './list-events.component';

@NgModule({
  declarations: [ListEventsComponent],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, EventsRoutingModule],
  providers: [],
})
export class EventsModule {}
