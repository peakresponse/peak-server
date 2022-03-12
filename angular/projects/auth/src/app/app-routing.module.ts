import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ForgotComponent } from './forgot.component';
import { LoginComponent } from './login.component';
import { ResetComponent } from './reset.component';

const routes: Routes = [
  {
    path: 'forgot-password',
    component: ForgotComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'reset-password/:token',
    component: ResetComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/login',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
