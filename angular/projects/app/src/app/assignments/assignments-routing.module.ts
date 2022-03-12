import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SelectAssignmentComponent } from './select-assignment.component';

const routes: Routes = [
  {
    path: 'assignments',
    component: SelectAssignmentComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssignmentsRoutingModule {}
