import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { BaseSchemaComponent } from './base-schema.component';
import { SchemaListComponent } from './schema-list.component';
import { SchemaRecordComponent } from './schema-record.component';

@NgModule({
  declarations: [BaseSchemaComponent, SchemaListComponent, SchemaRecordComponent],
  imports: [CommonModule, FormsModule, NgbModule, RouterModule, SharedModule],
  exports: [BaseSchemaComponent, SchemaListComponent, SchemaRecordComponent],
  providers: [],
})
export class SchemaModule {}
