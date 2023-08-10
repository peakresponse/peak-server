import { Component } from '@angular/core';
import { AgencyService } from 'shared';

@Component({
  templateUrl: './devices-record-demographics.component.html',
})
export class DevicesRecordDemographicsComponent {
  defaultValues = {
    data: {},
  };
  constructor(public agency: AgencyService) {}
}
