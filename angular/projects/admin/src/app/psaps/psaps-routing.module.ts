import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from 'shared';

import { EditPsapComponent } from './edit-psap.component';
import { ListPsapsComponent } from './list-psaps.component';

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
        path: ':id',
        component: EditPsapComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule],
})
export class PsapsRoutingModule {}
