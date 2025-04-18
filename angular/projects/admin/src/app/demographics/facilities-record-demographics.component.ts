import { Component } from '@angular/core';
import { AgencyService, XsdElement } from 'shared';

@Component({
  templateUrl: './facilities-record-demographics.component.html',
  standalone: false,
})
export class FacilitiesRecordDemographicsComponent {
  defaultValues = {
    isDraft: true,
    data: {
      'dFacility.FacilityGroup': {},
    },
  };

  constructor(public agency: AgencyService) {}
}
