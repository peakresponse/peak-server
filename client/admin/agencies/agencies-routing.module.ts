import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from '../../shared/services';

import { EditAgencyComponent, ListAgenciesComponent, NewAgencyComponent } from '.';

const appRoutes: Routes = [
  {
    path: 'agencies',
    component: ListAgenciesComponent,
    resolve: {
      agency: AgencyService,
      user: UserService,
    },
    children: [
      {
        path: 'new',
        component: NewAgencyComponent,
      },
      {
        path: ':id',
        component: EditAgencyComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule],
})
export class AgenciesRoutingModule {}
