import { Component } from '@angular/core';
import { AgencyService } from 'shared';

@Component({
  templateUrl: './locations-record-demographics.component.html',
})
export class LocationsRecordDemographicsComponent {
  defaultValues = {
    data: {},
  };
  constructor(public agency: AgencyService) {}
}
