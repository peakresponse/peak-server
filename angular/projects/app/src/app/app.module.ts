import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { AgencyService, ApiService, NavigationService, UserService } from 'shared';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AssignmentsModule } from './assignments/assignments.module';
import { EventsModule } from './events/events.module';
import { IncidentsModule } from './incidents/incidents.module';
import { VenueModule } from './venues/venues.module';

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, AssignmentsModule, EventsModule, IncidentsModule, VenueModule],
  providers: [AgencyService, ApiService, NavigationService, UserService, provideHttpClient(withInterceptorsFromDi())],
})
export class AppModule {}
