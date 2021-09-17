import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { InputsComponent } from './inputs.component';

const routes: Routes = [
  {
    path: 'inputs',
    component: InputsComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/inputs',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
