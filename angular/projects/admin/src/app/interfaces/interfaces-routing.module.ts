import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AgencyService, UserService } from 'shared';

import { ListInterfacesComponent } from './list-interfaces.component';
import { NewInterfaceComponent } from './new-interface.component';
import { EditInterfaceComponent } from './edit-interface.component';
import { NewInterfaceScreenComponent } from './screens/new-interface-screen.component';
import { EditInterfaceScreenComponent } from './screens/edit-interface-screen.component';
import { NewInterfaceSectionComponent } from './sections/new-interface-section.component';
import { EditInterfaceSectionComponent } from './sections/edit-interface-section.component';

const appRoutes: Routes = [
  {
    path: 'interfaces',
    component: ListInterfacesComponent,
    resolve: {
      agency: AgencyService,
      user: UserService,
    },
    children: [
      {
        path: 'new',
        component: NewInterfaceComponent,
      },
      {
        path: ':id',
        component: EditInterfaceComponent,
        children: [
          {
            path: 'screens/new',
            component: NewInterfaceScreenComponent,
          },
          {
            path: 'screens/:id',
            component: EditInterfaceScreenComponent,
            children: [
              {
                path: 'sections/new',
                component: NewInterfaceSectionComponent,
              },
              {
                path: 'sections/:id',
                component: EditInterfaceSectionComponent,
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
export class InterfacesRoutingModule {}
