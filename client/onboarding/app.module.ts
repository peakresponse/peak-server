import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import {
  AgencyService,
  ApiService,
  NavigationService,
  UserService,
} from '../shared/services';
import { SharedComponentsModule } from '../shared/components';
import { SharedPipesModule } from '../shared/pipes';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppService } from './app.service';

import { AccountComponent } from './account.component';
import { AgencyComponent } from './agency.component';
import { CompletedComponent } from './completed.component';
import { InviteComponent } from './invite.component';
import { NotifyComponent } from './notify.component';
import { StateComponent } from './state.component';
import { UrlComponent } from './url.component';
import { WelcomeComponent } from './welcome.component';

@NgModule({
  declarations: [
    AccountComponent,
    AppComponent,
    AgencyComponent,
    CompletedComponent,
    InviteComponent,
    NotifyComponent,
    StateComponent,
    UrlComponent,
    WelcomeComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgbModule,
    SharedComponentsModule,
    SharedPipesModule,
  ],
  providers: [
    AgencyService,
    ApiService,
    AppService,
    NavigationService,
    UserService,
  ],
  bootstrap: [AppComponent],
})
export class OnboardingAppModule {}
