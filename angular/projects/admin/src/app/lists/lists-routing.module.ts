import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from 'shared';

import { ListComponent } from './list.component';
import { ListListsComponent } from './list-lists.component';

const appRoutes: Routes = [
  {
    path: 'lists',
    component: ListListsComponent,
    resolve: {
      agency: AgencyService,
      user: UserService,
    },
    children: [
      {
        path: ':id',
        component: ListComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule],
})
export class ListsRoutingModule {}
