import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { IncidentsRoutingModule } from './incidents-routing.module';

import { ListIncidentsComponent } from './list-incidents.component';

@NgModule({
  declarations: [ListIncidentsComponent],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, IncidentsRoutingModule],
  providers: [],
})
export class IncidentsModule {}
