import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { ApiService, NavigationService } from 'shared';

import { SchemaListComponent } from '../schema/schema-list.component';

@Component({
  templateUrl: './custom-configurations-list-demographics.component.html',
})
export class CustomConfigurationsListDemographicsComponent {
  @ViewChild('list') list?: SchemaListComponent;

  sectionColumns = [{ name: 'Title', attr: ['dCustomConfiguration.01'], class: 'col-3' }];

  constructor(private api: ApiService, private navigation: NavigationService, public route: ActivatedRoute) {}

  onImport() {
    this.api.demographics.configurations.import().subscribe((response: HttpResponse<any>) => {
      const { id } = response.body ?? {};
      if (id) {
        this.navigation.goTo(`/demographics/configurations/${id}`);
      }
    });
  }
}
