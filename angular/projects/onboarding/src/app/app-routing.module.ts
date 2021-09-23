import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './welcome.component';
import { StateComponent } from './state.component';
import { NotifyComponent } from './notify.component';
import { AgencyComponent } from './agency.component';
import { UrlComponent } from './url.component';

const routes: Routes = [
  {
    path: 'agency',
    component: AgencyComponent,
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
