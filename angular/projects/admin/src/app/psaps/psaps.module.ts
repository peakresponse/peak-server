import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { PsapsRoutingModule } from './psaps-routing.module';

import { EditPsapComponent } from './edit-psap.component';
import { ListPsapDispatchersComponent } from './list-psap-dispatchers.component';
import { ListPsapsComponent } from './list-psaps.component';
import { NewPsapDispatcherComponent } from './new-psap-dispatcher.component';

@NgModule({
  declarations: [EditPsapComponent, ListPsapDispatchersComponent, ListPsapsComponent, NewPsapDispatcherComponent],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, PsapsRoutingModule],
  providers: [],
})
export class PsapsModule {}
