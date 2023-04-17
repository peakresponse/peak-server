import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDropzoneModule } from 'ngx-dropzone';

import { SharedModule } from 'shared';

import { StateResolver } from './state.resolver';
import { StatesRoutingModule } from './states-routing.module';
import { EditStateComponent } from './edit-state.component';
import { ListStatesComponent } from './list-states.component';
import { NemsisStateComponent } from './nemsis-state.component';

@NgModule({
  declarations: [EditStateComponent, ListStatesComponent, NemsisStateComponent],
  imports: [CommonModule, FormsModule, NgbModule, NgxDropzoneModule, SharedModule, StatesRoutingModule],
  providers: [StateResolver],
})
export class StatesModule {}
