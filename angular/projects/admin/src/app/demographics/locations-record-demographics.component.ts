import { Component } from '@angular/core';
import { AgencyService } from 'shared';

@Component({
  templateUrl: './locations-record-demographics.component.html',
  standalone: false,
})
export class LocationsRecordDemographicsComponent {
  defaultValues = {
    isDraft: true,
    data: {},
  };
  constructor(public agency: AgencyService) {}
}
