import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ApiService, NavigationService, SharedModule } from 'shared';

import { AppService } from './app.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WelcomeComponent } from './welcome.component';
import { StateComponent } from './state.component';
import { NotifyComponent } from './notify.component';
import { AgencyComponent } from './agency.component';
import { UrlComponent } from './url.component';
import { AccountComponent } from './account.component';
import { InviteComponent } from './invite.component';
import { DoneComponent } from './done.component';

@NgModule({
  declarations: [
    AppComponent,
    WelcomeComponent,
    StateComponent,
    NotifyComponent,
    AgencyComponent,
    UrlComponent,
    AccountComponent,
    InviteComponent,
    DoneComponent,
  ],
  bootstrap: [AppComponent],
  imports: [BrowserModule, FormsModule, NgbModule, SharedModule, AppRoutingModule],
  providers: [ApiService, AppService, NavigationService, provideHttpClient(withInterceptorsFromDi())],
})
export class AppModule {}
