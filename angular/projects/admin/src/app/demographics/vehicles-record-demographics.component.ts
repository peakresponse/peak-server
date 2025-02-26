import { Component } from '@angular/core';
import { AgencyService } from 'shared';

@Component({
  templateUrl: './vehicles-record-demographics.component.html',
  standalone: false,
})
export class VehiclesRecordDemographicsComponent {
  defaultValues = {
    isDraft: true,
    data: {},
  };
  constructor(public agency: AgencyService) {}
}
