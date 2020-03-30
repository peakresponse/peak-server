import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AgmCoreModule, LAZY_MAPS_API_CONFIG } from '@agm/core';
import { AgmOverlays } from 'agm-overlays';

import { Config } from './config';
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
    AgmCoreModule.forRoot(),
    AgmOverlays,
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
    {
      provide: LAZY_MAPS_API_CONFIG,
      useClass: Config
    }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class DashboardAppModule {}
