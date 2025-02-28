import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { get } from 'lodash-es';

import { ApiService, SchemaService, XsdSchema } from 'shared';

const MAPPING = {
  contacts: 'dContact_v3.xsd',
  locations: 'dLocation_v3.xsd',
  personnel: 'dPersonnel_v3.xsd',
};

@Component({
  selector: 'admin-demographics-version-validation-error',
  templateUrl: './validation-error-version-demographics.component.html',
  standalone: false,
})
export class ValidationErrorVersionDemographicsComponent implements OnInit {
  @Input() version: any;
  @Input() error: any;
  data: any;
  xsd?: XsdSchema;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private schema: SchemaService,
  ) {}

  ngOnInit() {
    const { section, id } = this.error ?? {};
    if (section && id) {
      const { isDraft, nemsisVersion } = this.version ?? {};
      if (Boolean(isDraft) && Boolean(nemsisVersion)) {
        this.schema.getXsd(isDraft, nemsisVersion, get(MAPPING, section)).subscribe((schema: any) => {
          this.xsd = new XsdSchema('DEM', schema, this.schema.getCommonTypes(false), this.version.demCustomConfiguration, '');
        });
      }
      get(this.api, ['demographics', section])
        .get(id)
        .subscribe((response: HttpResponse<any>) => {
          this.data = response.body;
        });
    }
  }
}
