import { Component } from '@angular/core';

import { AgencyService } from 'shared';

@Component({
  templateUrl: './configurations-record-demographics.component.html',
  standalone: false,
})
export class ConfigurationsRecordDemographicsComponent {
  defaultValues = {
    isDraft: true,
    data: {},
  };
  constructor(public agency: AgencyService) {}
}
