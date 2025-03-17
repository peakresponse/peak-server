import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { get } from 'lodash-es';

import { ApiService, models } from 'shared';

@Component({
  templateUrl: './validate-version-demographics.component.html',
  standalone: false,
})
export class ValidateVersionDemographicsComponent implements OnInit {
  id: string = '';
  data: any;
  validationErrors: any;
  errors: any;
  records: any;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
  ) {}

  get sections(): string[] | undefined {
    return this.errors ? Object.keys(this.errors).sort() : undefined;
  }

  errorsForSection(section: string): any[] | undefined {
    return this.errors?.[section] ? Object.keys(this.errors[section]) : undefined;
  }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.api.versions.get(this.id).subscribe((response: HttpResponse<any>) => (this.data = response.body));
    this.api.versions.validate(this.id).subscribe((response: HttpResponse<any>) => {
      this.validationErrors = response.body;
      this.errors = {};
      for (const error of this.validationErrors?.errors) {
        this.errors[error.section] ||= {};
        this.errors[error.section][error.id ?? ''] ||= [];
        this.errors[error.section][error.id ?? ''].push(error);
      }
      this.records = {};
      for (const section of this.sections ?? []) {
        this.records[section] ||= {};
        for (const id of this.errorsForSection(section) ?? []) {
          let request;
          if (id) {
            request = get(this.api, ['demographics', section]).get(id);
          } else {
            request = get(this.api, ['demographics', section]).index();
          }
          request.subscribe((response: HttpResponse<any>) => {
            this.records[section][id] = new models['3.5']['DEM'][section](response.body?.draft ?? response.body);
          });
        }
      }
    });
  }
}
