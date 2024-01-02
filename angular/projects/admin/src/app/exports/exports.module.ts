import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { ExportsRoutingModule } from './exports-routing.module';
import { ListExportsComponent } from './list-exports.component';
import { NewExportComponent } from './new-export.component';
import { EditExportComponent } from './edit-export.component';

@NgModule({
  declarations: [ListExportsComponent, NewExportComponent, EditExportComponent],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, ExportsRoutingModule],
  providers: [],
})
export class ExportsModule {}
