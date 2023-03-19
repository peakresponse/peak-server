import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, SchemaService, UserService } from 'shared';

import { EditVersionDemographicsComponent } from './edit-version-demographics.component';
import { ListVersionsDemographicsComponent } from './list-versions-demographics.component';

const appRoutes: Routes = [
  {
    path: 'demographics/versions',
    component: ListVersionsDemographicsComponent,
    resolve: {
      agency: AgencyService,
      user: UserService,
      schema: SchemaService,
    },
    children: [
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
