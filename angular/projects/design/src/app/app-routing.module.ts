import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BrandingComponent } from './branding.component';
import { ButtonsComponent } from './buttons.component';
import { IconsComponent } from './icons.component';
import { InputsComponent } from './inputs.component';
import { NavsComponent } from './navs.component';

const routes: Routes = [
  {
    path: 'branding',
    component: BrandingComponent,
  },
  {
    path: 'buttons',
    component: ButtonsComponent,
  },
  {
    path: 'icons',
    component: IconsComponent,
  },
  {
    path: 'inputs',
    component: InputsComponent,
  },
  {
    path: 'navs',
    component: NavsComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/branding',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
