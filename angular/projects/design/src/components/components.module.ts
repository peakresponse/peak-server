import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TextField } from './fields/text-field.component';

@NgModule({
  declarations: [TextField],
  exports: [TextField],
  imports: [CommonModule, FormsModule],
  providers: [],
})
export class ComponentsModule {}
