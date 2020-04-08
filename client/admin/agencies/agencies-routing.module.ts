import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EditAgencyComponent, ListAgenciesComponent, NewAgencyComponent } from '.';

const appRoutes: Routes = [
  {
    path: 'agencies',
    component: ListAgenciesComponent,
    children: [
      {
        path: 'new',
        component: NewAgencyComponent
      },
      {
        path: ':id',
        component: EditAgencyComponent
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
export class AgenciesRoutingModule {}
