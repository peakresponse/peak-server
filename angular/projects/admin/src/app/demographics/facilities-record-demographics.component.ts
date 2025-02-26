import { Component } from '@angular/core';
import { AgencyService } from 'shared';

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

  isGroup(element: any): boolean {
    return element?.['xs:complexType']?.['xs:sequence'] !== undefined;
  }

  groupElements(element: any): any[] {
    return element?.['xs:complexType']?.['xs:sequence']?.['xs:element'];
  }

  nestedData(data: any): any {
    return data['dFacility.FacilityGroup'];
  }
}
