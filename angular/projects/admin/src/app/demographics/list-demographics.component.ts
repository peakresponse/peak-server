import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpParams } from '@angular/common/http';

import { find } from 'lodash';

import { ApiService, AgencyService, NavigationService, SchemaService, UserService } from 'shared';

@Component({
  templateUrl: './list-demographics.component.html',
})
export class ListDemographicsComponent implements OnInit {
  section: string = '';
  sectionSchemaPath: string = '';
  sectionSchemaRootElementName: string = '';
  sectionColumns: any[] = [];

  sectionHeader: string = '';
  sectionSchema: any;
  sectionData: any;

  isLoading = false;
  error: any = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private agency: AgencyService,
    private navigation: NavigationService,
    private schema: SchemaService,
    private user: UserService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.schema.get(this.sectionSchemaPath).subscribe((schema: any) => {
      this.sectionSchema = schema;
      this.isLoading = !this.sectionSchema && !this.sectionData;
    });
    let params = new HttpParams();
    params = params.set('format', 'xmljs');
    (this.api.demographics as any)[this.section].index(params).subscribe((response: HttpResponse<any>) => {
      this.sectionData = response.body || {};
      this.isLoading = !this.sectionSchema && !this.sectionData;
    });
  }

  get rootElementName(): string {
    if (!this.sectionSchemaRootElementName) {
      this.sectionSchemaRootElementName = this.sectionSchema?.['xs:schema']?.['xs:complexType']?._attributes?.name;
    }
    return this.sectionSchemaRootElementName;
  }

  get data(): any {
    return this.sectionData?.[this.rootElementName];
  }

  get rootChildElements(): any[] {
    let complexType = this.sectionSchema?.['xs:schema']?.['xs:complexType'];
    if (Array.isArray(complexType)) {
      complexType = find(complexType, {
        _attributes: { name: this.rootElementName } as any,
      });
    }
    return complexType?.['xs:sequence']?.['xs:element'];
  }

  get groupElementName(): string {
    return this.rootChildElements?.[0]?._attributes?.name;
  }
}
