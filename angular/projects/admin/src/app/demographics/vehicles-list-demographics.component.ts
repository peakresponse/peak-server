import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SchemaListComponent } from '../schema/schema-list.component';
import { AgencyService } from 'shared';

@Component({
  templateUrl: './vehicles-list-demographics.component.html',
})
export class VehiclesListDemographicsComponent {
  @ViewChild('list') list?: SchemaListComponent;

  sectionColumns = [
    { name: 'Unit/Vehicle Number', attr: ['dVehicle.01'], class: 'col-3' },
    { name: 'VIN', attr: ['dVehicle.02'], class: 'col-3' },
    { name: 'Call Sign', attr: ['dVehicle.03'], class: 'col-3' },
  ];

  constructor(public agency: AgencyService, public route: ActivatedRoute) {}
}
