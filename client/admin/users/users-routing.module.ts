import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from '../../shared/services';

import { EditUserComponent, ListUsersComponent } from '.';

const appRoutes: Routes = [
  {
    path: 'users',
    component: ListUsersComponent,
    resolve: {
      agency: AgencyService,
      user: UserService,
    },
    children: [
      {
        path: ':id',
        component: EditUserComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
