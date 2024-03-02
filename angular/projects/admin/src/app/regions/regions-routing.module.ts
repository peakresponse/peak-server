import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from 'shared';

import { ListRegionsComponent } from './list-regions.component';
import { NewRegionComponent } from './new-region.component';
import { EditRegionComponent } from './edit-region.component';

const appRoutes: Routes = [
  {
    path: 'regions',
    component: ListRegionsComponent,
    resolve: {
      agency: AgencyService,
      user: UserService,
    },
    children: [
      {
        path: 'new',
        component: NewRegionComponent,
      },
      {
        path: ':id',
        component: EditRegionComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule],
})
export class RegionsRoutingModule {}
