import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListPatientsComponent, ShowPatientComponent } from '.';

const appRoutes: Routes = [
  {
    path: 'patients',
    component: ListPatientsComponent,
    children: [
      {
        path: ':id',
        component: ShowPatientComponent
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
export class PatientsRoutingModule {}
