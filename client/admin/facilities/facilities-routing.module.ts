import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EditFacilityComponent, ListFacilitiesComponent, NewFacilityComponent } from '.';

const appRoutes: Routes = [
  {
    path: 'facilities',
    component: ListFacilitiesComponent,
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
