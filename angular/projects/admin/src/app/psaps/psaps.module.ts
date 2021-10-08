import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { PsapsRoutingModule } from './psaps-routing.module';

import { EditPsapComponent } from './edit-psap.component';
import { ListPsapsComponent } from './list-psaps.component';

@NgModule({
  declarations: [EditPsapComponent, ListPsapsComponent],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, PsapsRoutingModule],
  providers: [],
})
export class PsapsModule {}
