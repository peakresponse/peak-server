import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ParentComponent } from '../components';
import { AgencyGuard } from '../agencies/agency.guard';
import { SceneGuard } from './scene.guard';
import {
  ListScenesComponent,
  NewSceneComponent,
  SceneMapComponent,
  SceneOverviewComponent,
  ScenePatientsComponent,
  SceneSummaryComponent,
} from '.';
import { PatientComponent, ScanPatientComponent } from './patients';
import { UserGuard } from '../users/user.guard';

const appRoutes: Routes = [
  {
    path: 'scenes',
    canActivateChild: [UserGuard],
    component: ParentComponent,
    children: [
      {
        path: 'new',
        component: NewSceneComponent,
      },
      {
        path: ':id',
        canActivate: [SceneGuard],
        canActivateChild: [SceneGuard],
        canDeactivate: [SceneGuard],
        component: ParentComponent,
        children: [
          {
            path: 'map',
            component: SceneMapComponent,
            children: [
              {
                path: 'patients/scan',
                component: ScanPatientComponent,
                outlet: 'modal',
              },
              {
                path: 'patients/:id',
                component: PatientComponent,
                outlet: 'modal',
              },
            ],
          },
          {
            path: 'overview',
            component: SceneOverviewComponent,
            children: [
              {
                path: 'patients/scan',
                component: ScanPatientComponent,
                outlet: 'modal',
              },
              {
                path: 'patients/:id',
                component: PatientComponent,
                outlet: 'modal',
              },
            ],
          },
          {
            path: 'patients',
            component: ScenePatientsComponent,
            children: [
              {
                path: 'patients/scan',
                component: ScanPatientComponent,
                outlet: 'modal',
              },
              {
                path: 'patients/:id',
                component: PatientComponent,
                outlet: 'modal',
              },
            ],
          },
          {
            path: 'summary',
            component: SceneSummaryComponent,
            canActivate: [AgencyGuard],
            canDeactivate: [AgencyGuard],
            children: [
              {
                path: 'patients/:id',
                component: PatientComponent,
                outlet: 'modal',
              },
            ],
          },
          {
            path: '',
            pathMatch: 'full',
            component: ParentComponent,
          },
        ],
      },
      {
        path: '',
        pathMatch: 'full',
        component: ListScenesComponent,
        canActivate: [AgencyGuard],
        canDeactivate: [AgencyGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule],
  providers: [SceneGuard],
})
export class ScenesRoutingModule {}
