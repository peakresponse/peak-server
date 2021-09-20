import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { ApiService, SharedModule } from 'shared';

import { AppComponent } from './app.component';
import { ForgotComponent } from './forgot.component';
import { LoginComponent } from './login.component';

@NgModule({
  declarations: [AppComponent, ForgotComponent, LoginComponent],
  imports: [BrowserModule, HttpClientModule, AppRoutingModule, SharedModule],
  providers: [ApiService],
  bootstrap: [AppComponent],
})
export class AppModule {}
