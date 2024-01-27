import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from 'shared';

import { ListGuidesComponent } from './list-guides.component';
import { NewGuideComponent } from './new-guide.component';
import { EditGuideComponent } from './edit-guide.component';
import { NewGuideSectionComponent } from './new-guide-section.component';
import { EditGuideSectionComponent } from './edit-guide-section.component';

const appRoutes: Routes = [
  {
    path: 'guides',
    component: ListGuidesComponent,
    resolve: {
      agency: AgencyService,
      user: UserService,
    },
    children: [
      {
        path: 'new',
        component: NewGuideComponent,
      },
      {
        path: ':id',
        component: EditGuideComponent,
        children: [
          {
            path: 'sections/new',
            component: NewGuideSectionComponent,
          },
          {
            path: 'sections/:id',
            component: EditGuideSectionComponent,
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
export class GuidesRoutingModule {}
