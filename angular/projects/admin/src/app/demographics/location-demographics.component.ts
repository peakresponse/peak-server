import { Component } from '@angular/core';

import { BaseDemographicsComponent } from './base-demographics.component';

@Component({
  templateUrl: './base-demographics.component.html',
  styleUrls: ['./base-demographics.component.scss'],
})
export class LocationDemographicsComponent extends BaseDemographicsComponent {
  ngOnInit() {
    this.section = 'locations';
    this.sectionHeader = 'Locations';
    this.sectionSchemaPath = '/nemsis/xsd/dLocation_v3.json';
    this.sectionColumns = [
      { name: 'Name', attr: ['dLocation.02'], class: 'col-3' },
      { name: 'Number', attr: ['dLocation.03'], class: 'col-3' },
    ];
    super.ngOnInit();
  }
}
