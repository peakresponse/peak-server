import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AgencyService } from 'shared';

@Component({
  templateUrl: './vehicles-list-demographics.component.html',
})
export class VehiclesListDemographicsComponent {
  sectionColumns = [
    { name: 'Unit/Vehicle Number', attr: ['dVehicle.01'], class: 'col-3' },
    { name: 'VIN', attr: ['dVehicle.02'], class: 'col-3' },
    { name: 'Call Sign', attr: ['dVehicle.03'], class: 'col-3' },
  ];

  constructor(
    public agency: AgencyService,
    public route: ActivatedRoute,
  ) {}
}
