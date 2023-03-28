import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SchemaListComponent } from '../schema/schema-list.component';

@Component({
  templateUrl: './configurations-list-demographics.component.html',
})
export class ConfigurationsListDemographicsComponent {
  @ViewChild('list') list?: SchemaListComponent;

  sectionColumns = [{ name: 'State ID', attr: ['dConfiguration.01'], class: 'col-3' }];

  constructor(public route: ActivatedRoute) {}

  onImport() {}
}
