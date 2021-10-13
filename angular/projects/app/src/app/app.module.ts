import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { ApiService, NavigationService, UserService } from 'shared';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AssignmentsModule } from './assignments/assignments.module';
import { IncidentsModule } from './incidents/incidents.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, AppRoutingModule, AssignmentsModule, IncidentsModule],
  providers: [ApiService, NavigationService, UserService],
  bootstrap: [AppComponent],
})
export class AppModule {}
