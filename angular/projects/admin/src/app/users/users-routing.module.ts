import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from 'shared';

import { EditUserComponent } from './edit-user.component';
import { ListUsersComponent } from './list-users.component';
import { NewUserComponent } from './new-user.component';
import { EditEmploymentComponent } from './edit-employment.component';
import { NewEmploymentComponent } from './new-employment.component';

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
        path: 'new',
        component: NewUserComponent,
      },
      {
        path: ':id',
        component: EditUserComponent,
      },
      {
        path: ':id/employments/new',
        component: NewEmploymentComponent,
      },
      {
        path: ':id/employments/:employmentId',
        component: EditEmploymentComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
