import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserGuard } from '../user.guard';

import { ListEventsComponent } from './list-events.component';

const routes: Routes = [
  {
    path: 'events',
    component: ListEventsComponent,
    canActivate: [UserGuard],
    children: [],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventsRoutingModule {}
