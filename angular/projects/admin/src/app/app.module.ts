import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AgencyService, NavigationService, UserService } from 'shared';

import { UsersModule } from './users/users.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, AppRoutingModule, UsersModule],
  providers: [AgencyService, NavigationService, UserService],
  bootstrap: [AppComponent],
})
export class AppModule {}
