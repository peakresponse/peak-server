import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListPatientsComponent, ShowPatientComponent } from '.';

const appRoutes: Routes = [
  {
    path: 'dashboard/:view',
    component: ListPatientsComponent,
    children: [
      {
        path: 'patients/:id',
        component: ShowPatientComponent,
        outlet: 'modal'
      },
    ]
  },
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
