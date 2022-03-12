import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from 'shared';

import { EditFacilityComponent } from './edit-facility.component';
import { ListFacilitiesComponent } from './list-facilities.component';
import { NewFacilityComponent } from './new-facility.component';

const appRoutes: Routes = [
  {
    path: 'facilities',
    component: ListFacilitiesComponent,
    resolve: {
      agency: AgencyService,
      user: UserService,
    },
    children: [
      {
        path: 'new',
        component: NewFacilityComponent,
      },
      {
        path: ':id',
        component: EditFacilityComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule],
})
export class FacilitiesRoutingModule {}
