import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SchemaListComponent } from '../schema/schema-list.component';

@Component({
  templateUrl: './locations-list-demographics.component.html',
})
export class LocationsListDemographicsComponent {
  @ViewChild('list') list?: SchemaListComponent;

  sectionColumns = [
    { name: 'Name', attr: ['dLocation.02'], class: 'col-3' },
    { name: 'Number', attr: ['dLocation.03'], class: 'col-3' },
  ];

  constructor(public route: ActivatedRoute) {}
}
