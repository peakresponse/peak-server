import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from '../shared/services';

import { DashboardComponent } from './dashboard.component';

const appRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    resolve: {
      agency: AgencyService,
      user: UserService,
    },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
