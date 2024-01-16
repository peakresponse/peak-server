import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { ExportsRoutingModule } from './exports-routing.module';
import { ListExportsComponent } from './list-exports.component';
import { ExportFormComponent } from './export-form.component';
import { NewExportComponent } from './new-export.component';
import { EditExportComponent } from './edit-export.component';
import { ExportTriggerFormComponent } from './export-trigger-form.component';
import { NewExportTriggerComponent } from './new-export-trigger.component';
import { EditExportTriggerComponent } from './edit-export-trigger.component';

@NgModule({
  declarations: [
    ListExportsComponent,
    ExportFormComponent,
    NewExportComponent,
    EditExportComponent,
    ExportTriggerFormComponent,
    NewExportTriggerComponent,
    EditExportTriggerComponent,
  ],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, ExportsRoutingModule],
  providers: [],
})
export class ExportsModule {}
