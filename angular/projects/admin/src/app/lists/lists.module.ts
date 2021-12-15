import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { ListsRoutingModule } from './lists-routing.module';
import { ListComponent } from './list.component';
import { ListListsComponent } from './list-lists.component';

@NgModule({
  declarations: [ListComponent, ListListsComponent],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, ListsRoutingModule],
  providers: [],
})
export class ListsModule {}
