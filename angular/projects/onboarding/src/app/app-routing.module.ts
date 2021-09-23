import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './welcome.component';
import { StateComponent } from './state.component';
import { NotifyComponent } from './notify.component';
import { AgencyComponent } from './agency.component';
import { UrlComponent } from './url.component';
import { AccountComponent } from './account.component';

const routes: Routes = [
  {
    path: 'account',
    component: AccountComponent,
  },
  {
    path: 'agency',
    component: AgencyComponent,
  },
  {
    path: 'exists',
    component: AccountComponent,
    data: {
      exists: true,
    },
  },
  {
    path: 'notify',
    component: NotifyComponent,
  },
  {
    path: 'state',
    component: StateComponent,
  },
  {
    path: 'url',
    component: UrlComponent,
  },
  {
    path: 'welcome',
    component: WelcomeComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/welcome',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
