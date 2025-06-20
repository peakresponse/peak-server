import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from 'shared';

import { UserGuard } from '../user.guard';

import { ListEventsComponent } from './list-events.component';
import { NewEventComponent } from './new-event.component';
import { EditEventComponent } from './edit-event.component';
import { EventIncidentsComponent } from './event-incidents.component';

const routes: Routes = [
  {
    path: 'events',
    component: ListEventsComponent,
    canActivate: [UserGuard],
    resolve: {
      agency: AgencyService,
      user: UserService,
    },
    children: [
      {
        path: 'new',
        component: NewEventComponent,
      },
      {
        path: ':id/details',
        component: EditEventComponent,
      },
      {
        path: ':id',
        component: EventIncidentsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventsRoutingModule {}
