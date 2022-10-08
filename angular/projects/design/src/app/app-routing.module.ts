import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BrandingComponent } from './branding.component';
import { ButtonsComponent } from './buttons.component';
import { HeadersComponent } from './headers.component';
import { IconsComponent } from './icons.component';
import { InputsComponent } from './inputs.component';
import { NavsComponent } from './navs.component';
import { TypographyComponent } from './typography.component';

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
    path: 'headers',
    component: HeadersComponent,
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
    path: 'typography',
    component: TypographyComponent,
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
