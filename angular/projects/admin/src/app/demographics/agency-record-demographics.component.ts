import { Component } from '@angular/core';
import { AgencyService } from 'shared';

@Component({
  templateUrl: './agency-record-demographics.component.html',
})
export class AgencyRecordDemographicsComponent {
  defaultValues = {
    isDraft: true,
    data: {},
  };
  constructor(public agency: AgencyService) {}
}
