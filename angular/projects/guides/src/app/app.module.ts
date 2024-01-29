import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ApiService, AgencyService, NavigationService, NotificationService, SchemaService, SharedModule, UserService } from 'shared';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GuideComponent } from './guide.component';

@NgModule({
  declarations: [AppComponent, GuideComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, NgbModule, SharedModule],
  providers: [ApiService, AgencyService, NavigationService, NotificationService, SchemaService, UserService],
  bootstrap: [AppComponent],
})
export class AppModule {}
