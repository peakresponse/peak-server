import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ParentComponent } from '../components';
import { SceneGuard } from './scene.guard';
import { ListScenesComponent, SceneMapComponent, SceneOverviewComponent, ScenePatientsComponent, SceneSummaryComponent } from '.';
import { PatientComponent } from './patients';

const appRoutes: Routes = [
  {
    path: 'scenes',
    component: ParentComponent,
    children: [
      {
        path: ':id',
        canActivate: [SceneGuard],
        canActivateChild: [SceneGuard],
        component: ParentComponent,
        children: [
          {
            path: 'map',
            component: SceneMapComponent,
            children: [
              {
                path: 'patients/:id',
                component: PatientComponent,
                outlet: 'modal'
              }
            ]
          },
          {
            path: 'overview',
            component: SceneOverviewComponent
          },
          {
            path: 'patients',
            component: ScenePatientsComponent,
            children: [
              {
                path: 'patients/:id',
                component: PatientComponent,
                outlet: 'modal'
              }
            ]
          },
          {
            path: '',
            pathMatch: 'full',
            component: SceneSummaryComponent
          }
        ]
      },
      {
        path: '',
        pathMatch: 'full',
        component: ListScenesComponent
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(appRoutes)
  ],
  exports: [
    RouterModule
  ],
  providers: [
    SceneGuard
  ]
})
export class ScenesRoutingModule {}
