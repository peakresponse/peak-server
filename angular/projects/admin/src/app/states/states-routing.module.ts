import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, SchemaService, UserService } from 'shared';

import { EditStateComponent } from './edit-state.component';
import { ListStatesComponent } from './list-states.component';

const appRoutes: Routes = [
  {
    path: 'states',
    component: ListStatesComponent,
    resolve: {
      agency: AgencyService,
      schema: SchemaService,
      user: UserService,
    },
    children: [
      {
        path: ':id',
        component: EditStateComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule],
})
export class StatesRoutingModule {}
