import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TextField } from './components/fields/text-field.component';

@NgModule({
  declarations: [TextField],
  imports: [CommonModule, FormsModule],
  exports: [TextField],
})
export class SharedModule {}
