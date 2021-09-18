import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ButtonsComponent } from './buttons.component';
import { IconsComponent } from './icons.component';
import { InputsComponent } from './inputs.component';

import { ComponentsModule } from '../components/components.module';

@NgModule({
  declarations: [AppComponent, ButtonsComponent, IconsComponent, InputsComponent],
  imports: [BrowserModule, AppRoutingModule, ComponentsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
