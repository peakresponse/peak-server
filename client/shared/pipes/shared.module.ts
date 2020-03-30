import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AssetPipe, CssUrlPipe, ErrorPipe, PhonePipe, RelativeDatePipe } from '.';

@NgModule({
  declarations: [
    AssetPipe,
    CssUrlPipe,
    ErrorPipe,
    PhonePipe,
    RelativeDatePipe,
  ],
  exports: [
    AssetPipe,
    CssUrlPipe,
    ErrorPipe,
    PhonePipe,
    RelativeDatePipe,
  ],
  imports: [
    CommonModule,
  ],
  providers: []
})
export class SharedPipesModule {}
