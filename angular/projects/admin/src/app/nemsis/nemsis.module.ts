import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { NemsisRoutingModule } from './nemsis-routing.module';
import { ListNemsisComponent } from './list-nemsis.component';

@NgModule({
  declarations: [ListNemsisComponent],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, NemsisRoutingModule],
  providers: [],
})
export class NemsisModule {}
