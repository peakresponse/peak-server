import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { ApiService, NavigationService, UserService } from 'shared';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AssignmentsModule } from './assignments/assignments.module';
import { EventsModule } from './events/events.module';
import { IncidentsModule } from './incidents/incidents.module';

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, AssignmentsModule, EventsModule, IncidentsModule],
  providers: [ApiService, NavigationService, UserService, provideHttpClient(withInterceptorsFromDi())],
})
export class AppModule {}
