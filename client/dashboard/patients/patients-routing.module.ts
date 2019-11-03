import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListPatientsComponent } from '.';

const appRoutes: Routes = [
  {
    path: 'patients',
    component: ListPatientsComponent,
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
