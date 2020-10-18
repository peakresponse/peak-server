import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { CssUrlPipe, ErrorPipe, GetPipe, InflectionPipe, PhonePipe, RelativeDatePipe } from '.';

@NgModule({
  declarations: [CssUrlPipe, ErrorPipe, GetPipe, InflectionPipe, PhonePipe, RelativeDatePipe],
  exports: [CssUrlPipe, ErrorPipe, GetPipe, InflectionPipe, PhonePipe, RelativeDatePipe],
  imports: [CommonModule],
  providers: [],
})
export class SharedPipesModule {}
