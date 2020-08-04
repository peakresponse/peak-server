import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from '../../shared/services';

import { EditFacilityComponent, ListFacilitiesComponent, NewFacilityComponent } from '.';

const appRoutes: Routes = [
  {
    path: 'facilities',
    component: ListFacilitiesComponent,
    resolve: {
      agency: AgencyService,
      user: UserService
    },
    children: [
      {
        path: 'new',
        component: NewFacilityComponent
      },
      {
        path: ':id',
        component: EditFacilityComponent
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class FacilitiesRoutingModule {}
