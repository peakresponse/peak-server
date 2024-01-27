import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { GuideComponent } from './guide.component';

const routes: Routes = [
  {
    path: ':slug',
    component: GuideComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/getting-started',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
