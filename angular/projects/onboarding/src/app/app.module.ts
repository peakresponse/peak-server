import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ApiService, NavigationService, SharedModule } from 'shared';

import { AppService } from './app.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './welcome.component';
import { StateComponent } from './state.component';
import { NotifyComponent } from './notify.component';

@NgModule({
  declarations: [AppComponent, WelcomeComponent, StateComponent, NotifyComponent],
  imports: [BrowserModule, FormsModule, HttpClientModule, SharedModule, AppRoutingModule],
  providers: [ApiService, AppService, NavigationService],
  bootstrap: [AppComponent],
})
export class AppModule {}
