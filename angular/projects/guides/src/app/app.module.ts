import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AgencyService, NavigationService, NotificationService, SchemaService, UserService } from 'shared';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, NgbModule],
  providers: [AgencyService, NavigationService, NotificationService, SchemaService, UserService],
  bootstrap: [AppComponent],
})
export class AppModule {}
