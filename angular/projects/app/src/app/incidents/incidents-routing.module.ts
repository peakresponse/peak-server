import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserGuard } from '../user.guard';

import { ListIncidentsComponent } from './list-incidents.component';

import { ListReportsComponent } from './reports/list-reports.component';
import { ReportComponent } from './reports/report.component';

const routes: Routes = [
  {
    path: 'incidents',
    component: ListIncidentsComponent,
    canActivate: [UserGuard],
    children: [
      {
        path: ':incidentId/reports',
        component: ListReportsComponent,
        children: [
          //   {
          //     path: 'new'
          //   },
          {
            path: ':reportId',
            component: ReportComponent,
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IncidentsRoutingModule {}
