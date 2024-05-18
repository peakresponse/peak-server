import { Component } from '@angular/core';
import { AgencyService } from 'shared';

@Component({
  templateUrl: './personnel-record-demographics.component.html',
})
export class PersonnelRecordDemographicsComponent {
  defaultValues = {
    isDraft: true,
    data: {},
  };
  constructor(public agency: AgencyService) {}
}
