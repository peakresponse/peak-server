import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ParentComponent } from '../components';
import { AgencyGuard } from '../agencies/agency.guard';
import { InviteUsersComponent, ListUsersComponent } from '.';
import { UserGuard } from './user.guard';

const appRoutes: Routes = [
  {
    path: 'users',
    canActivate: [UserGuard, AgencyGuard],
    canDeactivate: [AgencyGuard],
    component: ListUsersComponent,
    children: [
      {
        path: 'invite',
        outlet: 'modal',
        component: InviteUsersComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule],
  providers: [],
})
export class UsersRoutingModule {}
