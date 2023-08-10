import { Component } from '@angular/core';
import { AgencyService } from 'shared';

@Component({
  templateUrl: './vehicles-record-demographics.component.html',
})
export class VehiclesRecordDemographicsComponent {
  defaultValues = {
    data: {},
  };
  constructor(public agency: AgencyService) {}
}
