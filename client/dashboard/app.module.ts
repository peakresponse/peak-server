import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AgmCoreModule } from '@agm/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { PatientsModule } from './patients/patients.module';

import { ApiService, NavigationService, UserService, WebSocketService }
  from '../shared/services';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AgmCoreModule.forRoot({
      apiKey: window['env'].GOOGLE_MAPS_API_KEY
    }),
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
    UserService,
    WebSocketService,
  ],
  bootstrap: [
    AppComponent
  ]
})
export class DashboardAppModule {}
