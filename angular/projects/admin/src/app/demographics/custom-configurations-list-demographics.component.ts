import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { AgencyService, ApiService } from 'shared';

import { SchemaListComponent } from '../schema/schema-list.component';

@Component({
  templateUrl: './custom-configurations-list-demographics.component.html',
})
export class CustomConfigurationsListDemographicsComponent {
  @ViewChild('list') list?: SchemaListComponent;

  sectionColumns = [{ name: 'Title', attr: ['dCustomConfiguration.01'], class: 'col-9' }];

  constructor(private api: ApiService, private agency: AgencyService, public route: ActivatedRoute) {}

  onImport() {
    this.api.demographics.customConfigurations.import().subscribe((response: HttpResponse<any>) => {
      this.list?.refresh();
      this.agency.refresh();
    });
  }
}
