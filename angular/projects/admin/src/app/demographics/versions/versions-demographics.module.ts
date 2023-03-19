import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { VersionsDemographicsRoutingModule } from './versions-demographics-routing.module';

import { EditVersionDemographicsComponent } from './edit-version-demographics.component';
import { ListVersionsDemographicsComponent } from './list-versions-demographics.component';

@NgModule({
  declarations: [EditVersionDemographicsComponent, ListVersionsDemographicsComponent],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, VersionsDemographicsRoutingModule],
  providers: [],
})
export class VersionsDemographicsModule {}
