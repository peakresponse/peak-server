import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { ClientsRoutingModule } from './clients-routing.module';
import { EditClientComponent } from './edit-client.component';
import { ListClientsComponent } from './list-clients.component';
import { NewClientComponent } from './new-client.component';
import { ClientFormComponent } from './client-form.component';

@NgModule({
  declarations: [EditClientComponent, ListClientsComponent, NewClientComponent, ClientFormComponent],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, ClientsRoutingModule],
  providers: [],
})
export class ClientsModule {}
