import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService } from '../../services/api.service';
import { AgencyService } from '../../services/agency.service';
import { NavigationService } from '../../services/navigation.service';
import { NotificationService } from '../../services/notification.service';
import { SchemaService } from '../../services/schema.service';
import { UserService } from '../../services/user.service';

import { XsdSchema } from './xsd-schema';

@Component({
  template: '',
})
export class XsdBaseComponent implements OnInit {
  @Input() name?: string;
  @Input() dataSet?: string;
  @Input() keyPath: string[] = [];

  @Input() nemsisVersion?: string;
  @Input() xsd?: string;
  @Input() schemaRootElementName: string = '';
  @Input() customConfiguration?: any[];

  @Input() draftNemsisVersion?: string;
  @Input() draftXsd?: string;
  @Input() draftSchemaRootElementName: string = '';
  @Input() draftCustomConfiguration?: any[];

  @Input() data: any;

  schemaData?: XsdSchema;
  draftSchemaData?: XsdSchema;

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
    if (this.nemsisVersion && this.xsd) {
      this.schema.getXsd(false, this.nemsisVersion, this.xsd).subscribe((schema: any) => {
        this.schemaData = new XsdSchema(
          this.dataSet ?? '',
          schema,
          this.schema.getCommonTypes(false),
          this.customConfiguration,
          this.schemaRootElementName
        );
        this.isLoading = !this.schemaData && !(!this.draftNemsisVersion || this.draftSchemaData) && !this.data;
      });
    }
    if (this.draftNemsisVersion && this.draftXsd) {
      this.schema.getXsd(true, this.draftNemsisVersion, this.draftXsd).subscribe((schema: any) => {
        this.draftSchemaData = new XsdSchema(
          this.dataSet ?? '',
          schema,
          this.schema.getCommonTypes(true),
          this.draftCustomConfiguration,
          this.draftSchemaRootElementName
        );
        this.isLoading = !this.schemaData && !(!this.draftNemsisVersion || this.draftSchemaData) && !this.data;
      });
    }
  }
}
