import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from 'shared';

import { EditPsapComponent } from './edit-psap.component';
import { EditPsapDispatcherComponent } from './edit-psap-dispatcher.component';
import { ListPsapDispatchersComponent } from './list-psap-dispatchers.component';
import { ListPsapsComponent } from './list-psaps.component';
import { NewPsapDispatcherComponent } from './new-psap-dispatcher.component';

const appRoutes: Routes = [
  {
    path: 'psaps',
    component: ListPsapsComponent,
    resolve: {
      agency: AgencyService,
      user: UserService,
    },
    children: [
      {
        path: ':psapId/dispatchers/new',
        component: NewPsapDispatcherComponent,
      },
      {
        path: ':psapId/dispatchers/:id',
        component: EditPsapDispatcherComponent,
      },
      {
        path: ':psapId/dispatchers',
        component: ListPsapDispatchersComponent,
      },
      {
        path: ':id/edit',
        component: EditPsapComponent,
      },
      {
        path: ':id',
        pathMatch: 'full',
        redirectTo: '/psaps/:id/edit',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule],
})
export class PsapsRoutingModule {}
