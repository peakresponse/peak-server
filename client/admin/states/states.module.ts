import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedComponentsModule } from '../../shared/components';
import { SharedPipesModule } from '../../shared/pipes';

import { StatesRoutingModule } from './states-routing.module';
import { EditStateComponent, ListStatesComponent, NewStateComponent } from '.';

@NgModule({
  declarations: [EditStateComponent, ListStatesComponent, NewStateComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    SharedComponentsModule,
    SharedPipesModule,
    StatesRoutingModule,
  ],
  providers: [],
})
export class StatesModule {}
