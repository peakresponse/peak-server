import { Component } from '@angular/core';
import { AgencyService } from 'shared';

@Component({
  templateUrl: './custom-configurations-record-demographics.component.html',
})
export class CustomConfigurationsRecordDemographicsComponent {
  defaultValues = {
    isDraft: true,
    data: {},
  };

  constructor(public agency: AgencyService) {}
}
