import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AgencyService } from 'shared';

@Component({
  templateUrl: './locations-list-demographics.component.html',
  standalone: false,
})
export class LocationsListDemographicsComponent {
  sectionColumns = [
    { name: 'Name', attr: ['dLocation.02'], class: 'col-3' },
    { name: 'Number', attr: ['dLocation.03'], class: 'col-3' },
  ];

  constructor(
    public agency: AgencyService,
    public route: ActivatedRoute,
  ) {}
}
