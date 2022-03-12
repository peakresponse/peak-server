import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppGuard } from './app.guard';

import { WelcomeComponent } from './welcome.component';
import { StateComponent } from './state.component';
import { NotifyComponent } from './notify.component';
import { AgencyComponent } from './agency.component';
import { UrlComponent } from './url.component';
import { AccountComponent } from './account.component';
import { InviteComponent } from './invite.component';
import { DoneComponent } from './done.component';

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
    path: 'done',
    component: DoneComponent,
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
    canActivate: [AppGuard],
    component: AccountComponent,
    data: {
      exists: true,
    },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
