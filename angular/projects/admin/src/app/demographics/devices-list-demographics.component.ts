import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SchemaListComponent } from '../schema/schema-list.component';
import { AgencyService } from 'shared';

@Component({
  templateUrl: './devices-list-demographics.component.html',
})
export class DevicesListDemographicsComponent {
  @ViewChild('list') list?: SchemaListComponent;

  sectionColumns = [
    { name: 'Serial No', attr: ['dDevice.01'], class: 'col-5' },
    { name: 'Name', attr: ['dDevice.02'], class: 'col-6' },
    { name: 'Type', attr: ['dDevice.03'], class: 'col-5' },
  ];

  constructor(public agency: AgencyService, public route: ActivatedRoute) {}
}
