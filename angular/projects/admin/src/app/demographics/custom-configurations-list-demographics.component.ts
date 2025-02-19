import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { AgencyService, ApiService, XsdListComponent } from 'shared';

@Component({
  templateUrl: './custom-configurations-list-demographics.component.html',
  standalone: false,
})
export class CustomConfigurationsListDemographicsComponent {
  @ViewChild('list') list?: XsdListComponent;

  sectionColumns = [{ name: 'Title', attr: ['dCustomConfiguration.01'], class: 'col-9' }];

  constructor(
    public agency: AgencyService,
    private api: ApiService,
    public route: ActivatedRoute,
  ) {}

  onImport() {
    this.api.demographics.customConfigurations.import().subscribe((response: HttpResponse<any>) => {
      this.list?.refresh();
      this.agency.refresh();
    });
  }
}
