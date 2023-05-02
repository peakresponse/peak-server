import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SchemaListComponent } from '../schema/schema-list.component';

@Component({
  templateUrl: './facilities-list-demographics.component.html',
})
export class FacilitiesListDemographicsComponent {
  @ViewChild('list') list?: SchemaListComponent;

  sectionColumns = [
    { name: 'Type', attr: ['dFacility.01'], class: 'col-5' },
    {
      name: 'Name',
      attr: ['dFacility.FacilityGroup', 'dFacility.02'],
      class: 'col-5',
    },
  ];

  constructor(public route: ActivatedRoute) {}
}
