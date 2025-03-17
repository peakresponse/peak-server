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
  @Input() record: any;
  recordError: any;
  xsd?: XsdSchema;

  basePath?: string;
  stack?: any[];
  element: any;
  value: any;
  data: any;

  get link(): string[] {
    const routerLink = ['/demographics', this.error?.section ?? ''];
    if (this.error?.id) {
      routerLink.push(this.error.id);
    }
    return routerLink;
  }

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
          this.xsd = new XsdSchema('DEM', schema, this.schema.getCommonTypes(isDraft), this.version.demCustomConfiguration, '');
          if (this.record && this.xsd) {
            this.handleResponse();
          }
        });
      }
    }
  }

  handleResponse() {
    if (this.record.validationErrors) {
      this.recordError = { messages: this.record.validationErrors.errors };
    }
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
    // find matching child element
    let elements = this.xsd?.childElements ?? [];
    let element: any;
    for (element of elements) {
      if (element._attributes?.name === parts?.[0]) {
        break;
      }
    }
    let data: any = this.record.data;
    const baseParts = ['$'];
    if (this.xsd?.isGrouped) {
      baseParts.push(this.xsd?.groupElementName);
    }
    this.basePath = JSONPath.toPathString(baseParts);
    this.stack = stack;
    this.element = element;
    this.data = data;
  }
}
