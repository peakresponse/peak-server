import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedComponentsModule } from '../../shared/components';
import { SharedPipesModule } from '../../shared/pipes';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    SharedComponentsModule,
    SharedPipesModule,
  ],
  providers: [],
})
export class AgencyModule {}
