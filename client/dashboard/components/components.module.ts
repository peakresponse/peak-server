import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HeaderComponent, MainComponent, NavComponent, ParentComponent } from '.';

@NgModule({
  declarations: [
    HeaderComponent,
    MainComponent,
    NavComponent,
    ParentComponent
  ],
  exports: [
    HeaderComponent,
    MainComponent,
    NavComponent,
    ParentComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  providers: []
})
export class ComponentsModule {}
