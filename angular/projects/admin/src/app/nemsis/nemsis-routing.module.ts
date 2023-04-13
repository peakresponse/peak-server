import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from 'shared';

import { ListNemsisComponent } from './list-nemsis.component';

const appRoutes: Routes = [
  {
    path: 'nemsis',
    component: ListNemsisComponent,
    resolve: {
      agency: AgencyService,
      user: UserService,
    },
    children: [],
  },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule],
})
export class NemsisRoutingModule {}
