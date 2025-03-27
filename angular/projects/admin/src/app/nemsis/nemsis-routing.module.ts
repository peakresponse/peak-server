import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from 'shared';

import { ListNemsisComponent } from './list-nemsis.component';
import { NemsisComponent } from './nemsis.component';

const appRoutes: Routes = [
  {
    path: 'nemsis',
    component: ListNemsisComponent,
    resolve: {
      agency: AgencyService,
      user: UserService,
    },
    children: [
      {
        path: ':nemsisVersion',
        component: NemsisComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule],
})
export class NemsisRoutingModule {}
