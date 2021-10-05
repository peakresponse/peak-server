import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from 'shared';

import { UsersRoutingModule } from './users-routing.module';

import { EditUserComponent } from './edit-user.component';
import { ListUsersComponent } from './list-users.component';

@NgModule({
  declarations: [EditUserComponent, ListUsersComponent],
  imports: [CommonModule, FormsModule, SharedModule, UsersRoutingModule],
  providers: [],
})
export class UsersModule {}
