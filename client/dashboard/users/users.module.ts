import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedComponentsModule } from '../../shared/components';
import { SharedPipesModule } from '../../shared/pipes';

import { ComponentsModule } from '../components/components.module';
import { UsersRoutingModule } from './users-routing.module';

import { ListUsersComponent } from '.';

@NgModule({
  declarations: [ListUsersComponent],
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    SharedComponentsModule,
    SharedPipesModule,
    UsersRoutingModule,
  ],
})
export class UsersModule {}
