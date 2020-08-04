import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PatientComponent } from '.';

const appRoutes: Routes = [
  {
    path: 'patients/:id',
    component: PatientComponent,
    outlet: 'modal'
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
