import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ParentComponent } from '../components';
import { AgencyGuard } from '../agencies/agency.guard';
import { ListUsersComponent } from '.';
import { UserGuard } from './user.guard';

const appRoutes: Routes = [
  {
    path: 'users',
    canActivateChild: [UserGuard],
    component: ParentComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ListUsersComponent,
        canActivate: [AgencyGuard],
        canDeactivate: [AgencyGuard],
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
