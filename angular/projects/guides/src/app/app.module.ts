import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ApiService, AgencyService, NavigationService, NotificationService, SchemaService, SharedModule, UserService } from 'shared';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GuideComponent } from './guide.component';

@NgModule({ declarations: [AppComponent, GuideComponent],
    bootstrap: [AppComponent], imports: [BrowserModule, AppRoutingModule, NgbModule, SharedModule], providers: [ApiService, AgencyService, NavigationService, NotificationService, SchemaService, UserService, provideHttpClient(withInterceptorsFromDi())] })
export class AppModule {}
