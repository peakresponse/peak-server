import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { find } from 'lodash';

import { ApiService, AgencyService, NavigationService, NotificationService, SchemaService, UserService } from 'shared';

@Component({
  template: '',
})
export class XsdBaseComponent implements OnInit {
  @Input() name?: string;
  @Input() keyPath: string[] = [];

  @Input() schemaPath: string = '';

  @Input() nemsisVersion?: string;
  @Input() xsd?: string;

  @Input() draftNemsisVersion?: string;
  @Input() draftXsd?: string;

  @Input() schemaRootElementName: string = '';
  @Input() data: any;

  schemaData: any;
  draftSchemaData: any;

  isLoading = false;
  error: any = null;

  constructor(
    protected route: ActivatedRoute,
    protected api: ApiService,
    protected agency: AgencyService,
    protected navigation: NavigationService,
    protected notification: NotificationService,
    protected schema: SchemaService,
    protected user: UserService
  ) {}

  ngOnInit() {
    this.isLoading = true;
    if (this.schemaPath) {
      this.schema.get(this.schemaPath).subscribe((schema: any) => {
        this.schemaData = schema;
        this.isLoading = !this.schemaData && !(!this.draftNemsisVersion || this.draftSchemaData) && !this.data;
      });
    }
    if (this.nemsisVersion && this.xsd) {
      this.schema.getXsd(false, this.nemsisVersion, this.xsd).subscribe((schema: any) => {
        this.schemaData = schema;
        this.isLoading = !this.schemaData && !(!this.draftNemsisVersion || this.draftSchemaData) && !this.data;
      });
    }
    if (this.draftNemsisVersion && this.draftXsd) {
      this.schema.getXsd(true, this.draftNemsisVersion, this.draftXsd).subscribe((schema: any) => {
        this.draftSchemaData = schema;
        this.isLoading = !this.schemaData && !(!this.draftNemsisVersion || this.draftSchemaData) && !this.data;
      });
    }
  }

  get rootElementName(): string {
    if (!this.schemaRootElementName) {
      this.schemaRootElementName = this.schemaData?.['xs:schema']?.['xs:complexType']?._attributes?.name;
    }
    return this.schemaRootElementName;
  }

  get rootChildElements(): any[] {
    let complexType = this.schemaData?.['xs:schema']?.['xs:complexType'];
    if (Array.isArray(complexType)) {
      complexType = find(complexType, {
        _attributes: { name: this.rootElementName } as any,
      });
    }
    return complexType?.['xs:sequence']?.['xs:element'];
  }

  get isGrouped(): boolean {
    return this.rootChildElements?.length == 1;
  }

  get groupElementName(): string {
    return this.rootChildElements?.[0]?._attributes?.name;
  }

  get childElements(): any[] {
    let childElements = this.rootChildElements;
    if (childElements?.length == 1) {
      return childElements[0]?.['xs:complexType']?.['xs:sequence']?.['xs:element'];
    }
    return childElements;
  }
}
