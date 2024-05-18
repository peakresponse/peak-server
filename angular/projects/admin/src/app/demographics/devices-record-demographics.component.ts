import { Component } from '@angular/core';
import { AgencyService } from 'shared';

@Component({
  templateUrl: './devices-record-demographics.component.html',
})
export class DevicesRecordDemographicsComponent {
  defaultValues = {
    isDraft: true,
    data: {},
  };
  constructor(public agency: AgencyService) {}
}
