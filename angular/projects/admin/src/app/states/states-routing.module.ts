import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, SchemaService, UserService } from 'shared';

import { StateResolver } from './state.resolver';
import { EditStateComponent } from './edit-state.component';
import { ListStatesComponent } from './list-states.component';
import { NemsisStateComponent } from './nemsis-state.component';

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
        resolve: {
          state: StateResolver,
        },
        children: [
          {
            path: 'nemsis',
            component: NemsisStateComponent,
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule],
})
export class StatesRoutingModule {}
