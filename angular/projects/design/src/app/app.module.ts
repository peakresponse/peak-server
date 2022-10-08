import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrandingComponent } from './branding.component';
import { ButtonsComponent } from './buttons.component';
import { HeadersComponent } from './headers.component';
import { IconsComponent } from './icons.component';
import { InputsComponent } from './inputs.component';
import { NavsComponent } from './navs.component';
import { TypographyComponent } from './typography.component';

import { SharedModule, ApiService, UserService } from 'shared';

@NgModule({
  declarations: [
    AppComponent,
    BrandingComponent,
    ButtonsComponent,
    HeadersComponent,
    IconsComponent,
    InputsComponent,
    NavsComponent,
    TypographyComponent,
  ],
  imports: [BrowserModule, FormsModule, HttpClientModule, AppRoutingModule, SharedModule],
  providers: [ApiService, UserService],
  bootstrap: [AppComponent],
})
export class AppModule {}
