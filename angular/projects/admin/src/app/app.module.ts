import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AgencyService, NavigationService, UserService } from 'shared';

import { FacilitiesModule } from './facilities/facilities.module';
import { StatesModule } from './states/states.module';
import { UsersModule } from './users/users.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, AppRoutingModule, FacilitiesModule, StatesModule, UsersModule],
  providers: [AgencyService, NavigationService, UserService],
  bootstrap: [AppComponent],
})
export class AppModule {}
