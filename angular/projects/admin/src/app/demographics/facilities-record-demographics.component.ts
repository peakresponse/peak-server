import { Component } from '@angular/core';

@Component({
  templateUrl: './facilities-record-demographics.component.html',
})
export class FacilitiesRecordDemographicsComponent {
  defaultValues = {
    data: {
      'dFacility.FacilityGroup': {},
    },
  };

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
