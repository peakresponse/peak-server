import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from 'shared';

import { FormsDemographicsRoutingModule } from './forms-demographics-routing.module';

import { FormDemographicsComponent } from './form-demographics.component';
import { EditFormDemographicsComponent } from './edit-form-demographics.component';
import { ListFormsDemographicsComponent } from './list-forms-demographics.component';
import { NewFormDemographicsComponent } from './new-form-demographics.component';
import { SignatureFormDemographicsComponent } from './signature-form-demographics.component';

@NgModule({
  declarations: [
    EditFormDemographicsComponent,
    FormDemographicsComponent,
    ListFormsDemographicsComponent,
    NewFormDemographicsComponent,
    SignatureFormDemographicsComponent,
  ],
  imports: [CommonModule, FormsModule, NgbModule, SharedModule, FormsDemographicsRoutingModule],
  providers: [],
})
export class FormsDemographicsModule {}
