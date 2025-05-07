import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from 'shared';

import { UserGuard } from '../user.guard';

import { ListVenuesComponent } from './list-venues.component';

const routes: Routes = [
  {
    path: 'venues',
    component: ListVenuesComponent,
    canActivate: [UserGuard],
    resolve: {
      agency: AgencyService,
      user: UserService,
    },
    children: [
      // {
      //   path: 'new',
      //   component: NewEventComponent,
      // },
      // {
      //   path: ':id/details',
      //   component: EditEventComponent,
      // },
      // {
      //   path: ':id',
      //   component: EventIncidentsComponent,
      // },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VenuesRoutingModule {}
