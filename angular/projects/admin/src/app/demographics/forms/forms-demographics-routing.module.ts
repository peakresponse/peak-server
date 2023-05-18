import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from 'shared';

import { EditFormDemographicsComponent } from './edit-form-demographics.component';
import { ListFormsDemographicsComponent } from './list-forms-demographics.component';
import { NewFormDemographicsComponent } from './new-form-demographics.component';

const appRoutes: Routes = [
  {
    path: 'demographics/forms',
    component: ListFormsDemographicsComponent,
    resolve: {
      agency: AgencyService,
      user: UserService,
    },
    children: [
      {
        path: 'new',
        component: NewFormDemographicsComponent,
      },
      {
        path: ':id',
        component: EditFormDemographicsComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule],
})
export class FormsDemographicsRoutingModule {}
