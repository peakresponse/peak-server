import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { VersionsDemographicsRoutingModule } from './versions-demographics-routing.module';

import { EditVersionDemographicsComponent } from './edit-version-demographics.component';
import { ListVersionsDemographicsComponent } from './list-versions-demographics.component';
import { PreviewVersionDemographicsComponent } from './preview-version-demographics.component';
import { ValidateVersionDemographicsComponent } from './validate-version-demographics.component';
import { ValidationErrorVersionDemographicsComponent } from './validation-error-version-demographics.component';

@NgModule({
  declarations: [
    EditVersionDemographicsComponent,
    ListVersionsDemographicsComponent,
    PreviewVersionDemographicsComponent,
    ValidateVersionDemographicsComponent,
    ValidationErrorVersionDemographicsComponent,
  ],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, VersionsDemographicsRoutingModule],
  providers: [],
})
export class VersionsDemographicsModule {}
