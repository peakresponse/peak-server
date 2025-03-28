import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AgencyService, NavigationService, NotificationService, SchemaService, UserService } from 'shared';

import { AgenciesModule } from './agencies/agencies.module';
import { ClientsModule } from './clients/clients.module';
import { DemographicsModule } from './demographics/demographics.module';
import { ExportsModule } from './exports/exports.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { GuidesModule } from './guides/guides.module';
import { InterfacesModule } from './interfaces/interfaces.module';
import { ListsModule } from './lists/lists.module';
import { NemsisModule } from './nemsis/nemsis.module';
import { PsapsModule } from './psaps/psaps.module';
import { RegionsModule } from './regions/regions.module';
import { StatesModule } from './states/states.module';
import { UsersModule } from './users/users.module';

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    NgbModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
    }),
    AppRoutingModule,
    AgenciesModule,
    ClientsModule,
    DemographicsModule,
    ExportsModule,
    FacilitiesModule,
    GuidesModule,
    InterfacesModule,
    ListsModule,
    NemsisModule,
    PsapsModule,
    RegionsModule,
    StatesModule,
    UsersModule,
  ],
  providers: [
    AgencyService,
    NavigationService,
    NotificationService,
    SchemaService,
    UserService,
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {}
