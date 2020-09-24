import { Component } from '@angular/core';

import { BaseDemographicsComponent } from './base-demographics.component';

@Component({
  templateUrl: './base-demographics.component.html',
  styleUrls: ['./base-demographics.component.scss'],
})
export class VehicleDemographicsComponent extends BaseDemographicsComponent {
  ngOnInit() {
    this.section = 'vehicles';
    this.sectionHeader = 'Vehicles';
    this.sectionSchemaPath = '/nemsis/xsd/dVehicle_v3.json';
    this.sectionColumns = [
      { name: 'Unit/Vehicle Number', attr: ['dVehicle.01'], class: 'col-3' },
      { name: 'VIN', attr: ['dVehicle.02'], class: 'col-3' },
      { name: 'Call Sign', attr: ['dVehicle.03'], class: 'col-3' },
    ];
    super.ngOnInit();
  }
}
