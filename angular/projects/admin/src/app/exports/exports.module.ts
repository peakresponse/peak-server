import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { ExportsRoutingModule } from './exports-routing.module';
import { ListExportsComponent } from './list-exports.component';

@NgModule({
  declarations: [ListExportsComponent],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, ExportsRoutingModule],
  providers: [],
})
export class ExportsModule {}
