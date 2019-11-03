import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { PatientsModule } from './patients/patients.module';

import { ApiService, NavigationService, UserService } from '../shared/services';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    PatientsModule
  ],
  providers: [
    ApiService,
    NavigationService,
    UserService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class DashboardAppModule {}
