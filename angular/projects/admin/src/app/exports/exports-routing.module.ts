import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from 'shared';

import { ListExportsComponent } from './list-exports.component';

const appRoutes: Routes = [
  {
    path: 'exports',
    component: ListExportsComponent,
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
export class ExportsRoutingModule {}
