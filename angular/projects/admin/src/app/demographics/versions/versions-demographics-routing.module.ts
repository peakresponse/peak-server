import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from 'shared';

import { EditVersionDemographicsComponent } from './edit-version-demographics.component';
import { ListVersionsDemographicsComponent } from './list-versions-demographics.component';
import { PreviewVersionDemographicsComponent } from './preview-version-demographics.component';

const appRoutes: Routes = [
  {
    path: 'demographics/versions',
    component: ListVersionsDemographicsComponent,
    resolve: {
      agency: AgencyService,
      user: UserService,
    },
    children: [
      {
        path: ':id/preview',
        component: PreviewVersionDemographicsComponent,
      },
      {
        path: ':id',
        component: EditVersionDemographicsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule],
})
export class VersionsDemographicsRoutingModule {}
