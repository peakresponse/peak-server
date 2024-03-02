import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AgencyService, NavigationService, NotificationService, SchemaService, UserService } from 'shared';

import { AgenciesModule } from './agencies/agencies.module';
import { ClientsModule } from './clients/clients.module';
import { DemographicsModule } from './demographics/demographics.module';
import { ExportsModule } from './exports/exports.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { GuidesModule } from './guides/guides.module';
import { ListsModule } from './lists/lists.module';
import { NemsisModule } from './nemsis/nemsis.module';
import { PsapsModule } from './psaps/psaps.module';
import { RegionsModule } from './regions/regions.module';
import { StatesModule } from './states/states.module';
import { UsersModule } from './users/users.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgbModule,
    AppRoutingModule,
    AgenciesModule,
    ClientsModule,
    DemographicsModule,
    ExportsModule,
    FacilitiesModule,
    GuidesModule,
    ListsModule,
    NemsisModule,
    PsapsModule,
    RegionsModule,
    StatesModule,
    UsersModule,
  ],
  providers: [AgencyService, NavigationService, NotificationService, SchemaService, UserService],
  bootstrap: [AppComponent],
})
export class AppModule {}
