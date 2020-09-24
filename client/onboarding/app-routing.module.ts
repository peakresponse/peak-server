import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppGuard } from './app.guard';

import { AccountComponent } from './account.component';
import { AgencyComponent } from './agency.component';
import { CompletedComponent } from './completed.component';
import { InviteComponent } from './invite.component';
import { NotifyComponent } from './notify.component';
import { StateComponent } from './state.component';
import { UrlComponent } from './url.component';
import { WelcomeComponent } from './welcome.component';

const appRoutes: Routes = [
  {
    path: 'account',
    component: AccountComponent,
  },
  {
    path: 'agency',
    component: AgencyComponent,
  },
  {
    path: 'done',
    component: CompletedComponent,
  },
  {
    path: 'exists',
    component: AccountComponent,
    data: {
      exists: true,
    },
  },
  {
    path: 'invite',
    component: InviteComponent,
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
    path: 'welcome',
    component: WelcomeComponent,
  },
  {
    path: 'url',
    component: UrlComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    canActivate: [AppGuard],
    component: AccountComponent,
    data: {
      exists: true,
    },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
