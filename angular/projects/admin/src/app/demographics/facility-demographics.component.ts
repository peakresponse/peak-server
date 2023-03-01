import { Component } from '@angular/core';

import { BaseDemographicsComponent } from './base-demographics.component';

@Component({
  templateUrl: './facility-demographics.component.html',
  styleUrls: ['./base-demographics.component.scss'],
})
export class FacilityDemographicsComponent extends BaseDemographicsComponent {
  ngOnInit() {
    this.section = 'facilities';
    this.sectionHeader = 'Facilities';
    this.sectionSchemaPath = '/nemsis/xsd/dFacility_v3.json';
    this.sectionColumns = [
      { name: 'Type', attr: ['dFacility.01'], class: 'col-5' },
      {
        name: 'Name',
        attr: ['dFacility.FacilityGroup', 'dFacility.02'],
        class: 'col-5',
      },
    ];
    super.ngOnInit();
  }
}
