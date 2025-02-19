import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { AgencyService, ApiService, NavigationService } from 'shared';

@Component({
  templateUrl: './configurations-list-demographics.component.html',
  standalone: false,
})
export class ConfigurationsListDemographicsComponent {
  sectionColumns = [{ name: 'State ID', attr: ['dConfiguration.01'], class: 'col-3' }];

  constructor(
    public agency: AgencyService,
    private api: ApiService,
    private navigation: NavigationService,
    public route: ActivatedRoute,
  ) {}

  onImport() {
    this.api.demographics.configurations.import().subscribe((response: HttpResponse<any>) => {
      const { id } = response.body ?? {};
      if (id) {
        this.navigation.goTo(`/demographics/configurations/${id}`);
      }
    });
  }
}
