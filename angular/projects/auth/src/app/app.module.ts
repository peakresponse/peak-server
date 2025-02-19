import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { ApiService, SharedModule } from 'shared';

import { AppComponent } from './app.component';
import { ForgotComponent } from './forgot.component';
import { LoginComponent } from './login.component';
import { ResetComponent } from './reset.component';

@NgModule({ declarations: [AppComponent, ForgotComponent, LoginComponent, ResetComponent],
    bootstrap: [AppComponent], imports: [BrowserModule, AppRoutingModule, SharedModule], providers: [ApiService, provideHttpClient(withInterceptorsFromDi())] })
export class AppModule {}
