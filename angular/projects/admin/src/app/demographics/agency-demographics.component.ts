import { Component } from '@angular/core';

import { BaseDemographicsComponent } from './base-demographics.component';

@Component({
  templateUrl: './base-demographics.component.html',
  styleUrls: ['./base-demographics.component.scss'],
})
export class AgencyDemographicsComponent extends BaseDemographicsComponent {
  ngOnInit() {
    this.section = 'agency';
    this.sectionHeader = 'Agency';
    this.sectionSchemaPath = '/nemsis/xsd/dAgency_v3.json';
    super.ngOnInit();
  }
}
