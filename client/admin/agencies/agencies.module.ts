import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedComponentsModule } from '../../shared/components';
import { SharedPipesModule } from '../../shared/pipes';

import { AgenciesRoutingModule } from './agencies-routing.module';
import { EditAgencyComponent, ListAgenciesComponent, NewAgencyComponent } from '.';

@NgModule({
  declarations: [
    EditAgencyComponent,
    ListAgenciesComponent,
    NewAgencyComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    SharedComponentsModule,
    SharedPipesModule,
    AgenciesRoutingModule
  ],
  providers: []
})
export class AgenciesModule {}
