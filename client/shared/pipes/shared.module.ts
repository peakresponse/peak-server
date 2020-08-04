import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AssetPipe, CssUrlPipe, ErrorPipe, GetPipe, InflectionPipe, PhonePipe,
  RelativeDatePipe } from '.';

@NgModule({
  declarations: [
    AssetPipe,
    CssUrlPipe,
    ErrorPipe,
    GetPipe,
    InflectionPipe,
    PhonePipe,
    RelativeDatePipe,
  ],
  exports: [
    AssetPipe,
    CssUrlPipe,
    ErrorPipe,
    GetPipe,
    InflectionPipe,
    PhonePipe,
    RelativeDatePipe,
  ],
  imports: [
    CommonModule,
  ],
  providers: []
})
export class SharedPipesModule {}
