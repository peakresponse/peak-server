import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from 'shared';

import { EditClientComponent } from './edit-client.component';
import { ListClientsComponent } from './list-clients.component';
import { NewClientComponent } from './new-client.component';

const appRoutes: Routes = [
  {
    path: 'clients',
    component: ListClientsComponent,
    resolve: {
      agency: AgencyService,
      user: UserService,
    },
    children: [
      {
        path: 'new',
        component: NewClientComponent,
      },
      {
        path: ':id',
        component: EditClientComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule],
})
export class ClientsRoutingModule {}
