import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { JSONPath } from 'jsonpath-plus';
import { get } from 'lodash-es';

import { ApiService, SchemaService, XsdSchema } from 'shared';

const MAPPING = {
  agency: 'dAgency_v3.xsd',
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

  record: any;
  xsd?: XsdSchema;

  basePath?: string;
  stack?: any[];
  element?: any;
  value?: any;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private schema: SchemaService,
  ) {}

  ngOnInit() {
    const { section, id } = this.error ?? {};
    if (section) {
      const { isDraft, nemsisVersion } = this.version ?? {};
      if (Boolean(isDraft) && Boolean(nemsisVersion)) {
        this.schema.getXsd(isDraft, nemsisVersion, get(MAPPING, section)).subscribe((schema: any) => {
          this.xsd = new XsdSchema('DEM', schema, this.schema.getCommonTypes(false), this.version.demCustomConfiguration, '');
          if (this.record && this.xsd) {
            this.handleResponse();
          }
        });
      }
      if (id) {
        get(this.api, ['demographics', section])
          .get(id)
          .subscribe((response: HttpResponse<any>) => {
            this.record = response.body?.draft ?? response.body;
            if (this.record && this.xsd) {
              this.handleResponse();
            }
          });
      } else {
        get(this.api, ['demographics', section])
          .index()
          .subscribe((response: HttpResponse<any>) => {
            this.record = response.body?.draft ?? response.body;
            if (this.record && this.xsd) {
              this.handleResponse();
            }
          });
      }
    }
  }

  handleResponse() {
    const { path } = this.error ?? {};
    let parts: string[] | undefined;
    if (path) {
      parts = JSONPath.toPathArray(path);
    }
    const stack = [];
    if (this.xsd?.isGrouped) {
      stack.push({ element: this.xsd?.rootChildElements?.[0], path: '$' });
      const index = parts?.indexOf(this.xsd?.groupElementName ?? '');
      if (index !== undefined && index > -1) {
        parts = parts?.slice(index + 1);
      }
      if (!Number.isNaN(parseInt(parts?.[0] ?? '', 10))) {
        parts = parts?.slice(1);
      }
    } else {
      const index = parts?.indexOf(this.xsd?.rootElementName ?? '');
      if (index !== undefined && index > -1) {
        parts = parts?.slice(index + 1);
      }
    }
    // traverse remaining parts to get element and value
    let elements = this.xsd?.childElements ?? [];
    let element: any;
    let value: any;
    const baseParts = ['$'];
    parts?.forEach((part, index) => {
      if (index == (parts?.length ?? 0) - 1) {
        for (element of elements) {
          if (element._attributes?.name === part) {
            break;
          }
        }
        value = JSONPath({ path: JSONPath.toPathString(baseParts), json: this.record.data, wrap: false });
      } else {
        baseParts.push(part);
      }
    });

    this.basePath = JSONPath.toPathString(baseParts);
    this.stack = stack;
    this.element = element;
    this.value = value;
  }
}
