import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserGuard } from '../user.guard';
import { ListIncidentsComponent } from './list-incidents.component';

const routes: Routes = [
  {
    path: 'incidents',
    component: ListIncidentsComponent,
    canActivate: [UserGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IncidentsRoutingModule {}
