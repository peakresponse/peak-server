import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SharedPipesModule } from '../../shared/pipes';

import {
  ActiveScenesComponent,
  HeaderComponent,
  MainComponent,
  NavComponent,
  ParentComponent,
} from '.';

@NgModule({
  declarations: [
    ActiveScenesComponent,
    HeaderComponent,
    MainComponent,
    NavComponent,
    ParentComponent,
  ],
  exports: [
    ActiveScenesComponent,
    HeaderComponent,
    MainComponent,
    NavComponent,
    ParentComponent,
  ],
  imports: [CommonModule, FormsModule, RouterModule, SharedPipesModule],
  providers: [],
})
export class ComponentsModule {}
