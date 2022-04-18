import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { AppGuard } from './app.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [AppGuard],
    component: AppComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
