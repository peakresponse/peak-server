import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from 'shared';

import { UserGuard } from '../user.guard';

import { EditVenueComponent } from './edit-venue.component';
import { ListVenuesComponent } from './list-venues.component';
import { NewVenueComponent } from './new-venue.component';

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
      {
        path: 'new',
        component: NewVenueComponent,
      },
      {
        path: ':id',
        component: EditVenueComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VenuesRoutingModule {}
