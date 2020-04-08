import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { EditStateComponent, ListStatesComponent, NewStateComponent } from '.';

const appRoutes: Routes = [
  {
    path: 'states',
    component: ListStatesComponent,
    children: [
      {
        path: 'new',
        component: NewStateComponent
      },
      {
        path: ':id',
        component: EditStateComponent
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
export class StatesRoutingModule {}
