import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { ComponentsModule } from '../components/components.module';

import { AssignmentsRoutingModule } from './assignments-routing.module';

import { SelectAssignmentComponent } from './select-assignment.component';

@NgModule({
  declarations: [SelectAssignmentComponent],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, ComponentsModule, AssignmentsRoutingModule],
  providers: [],
})
export class AssignmentsModule {}
