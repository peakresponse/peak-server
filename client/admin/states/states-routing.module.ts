import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from '../../shared/services';

import { EditStateComponent, ListStatesComponent, NewStateComponent } from '.';

const appRoutes: Routes = [
  {
    path: 'states',
    component: ListStatesComponent,
    resolve: {
      agency: AgencyService,
      user: UserService,
    },
    children: [
      {
        path: 'new',
        component: NewStateComponent,
      },
      {
        path: ':id',
        component: EditStateComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule],
})
export class StatesRoutingModule {}
