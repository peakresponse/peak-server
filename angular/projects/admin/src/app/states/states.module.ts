import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { StatesRoutingModule } from './states-routing.module';
import { EditStateComponent } from './edit-state.component';
import { ListStatesComponent } from './list-states.component';

@NgModule({
  declarations: [EditStateComponent, ListStatesComponent],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, StatesRoutingModule],
  providers: [],
})
export class StatesModule {}
