import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from 'shared';

import { ListExportsComponent } from './list-exports.component';
import { NewExportComponent } from './new-export.component';
import { EditExportComponent } from './edit-export.component';
import { NewExportTriggerComponent } from './new-export-trigger.component';
import { EditExportTriggerComponent } from './edit-export-trigger.component';
import { ExportLogComponent } from './export-log.component';

const appRoutes: Routes = [
  {
    path: 'exports',
    component: ListExportsComponent,
    resolve: {
      agency: AgencyService,
      user: UserService,
    },
    children: [
      {
        path: 'new',
        component: NewExportComponent,
      },
      {
        path: ':id',
        component: EditExportComponent,
        children: [
          {
            path: 'triggers/new',
            component: NewExportTriggerComponent,
          },
          {
            path: 'triggers/:id',
            component: EditExportTriggerComponent,
            children: [
              {
                path: 'logs/:id',
                component: ExportLogComponent,
              },
            ],
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
export class ExportsRoutingModule {}
