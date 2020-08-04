import { Component } from '@angular/core';

import { BaseDemographicsComponent } from './base-demographics.component';

@Component({
  templateUrl: './base-demographics.component.html',
  styleUrls: ['./base-demographics.component.scss']
})
export class DeviceDemographicsComponent extends BaseDemographicsComponent {
  ngOnInit() {
    this.section = 'devices';
    this.sectionHeader = 'Devices';
    this.sectionSchemaPath = '/nemsis/xsd/dDevice_v3.json';
    this.sectionColumns = [
      {name: 'Serial No', attr: ['dDevice.01'], class: 'col-5'},
      {name: 'Name', attr: ['dDevice.02'], class: 'col-6'},
      {name: 'Type', attr: ['dDevice.03'], class: 'col-5'}
    ]
    super.ngOnInit();
  }
}
