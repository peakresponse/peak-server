import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { AgenciesRoutingModule } from './agencies-routing.module';
import { EditAgencyComponent } from './edit-agency.component';
import { ListAgenciesComponent } from './list-agencies.component';
import { NewAgencyComponent } from './new-agency.component';

@NgModule({
  declarations: [EditAgencyComponent, ListAgenciesComponent, NewAgencyComponent],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, AgenciesRoutingModule],
  providers: [],
})
export class AgenciesModule {}
