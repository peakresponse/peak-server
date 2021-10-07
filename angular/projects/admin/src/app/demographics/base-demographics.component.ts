import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { find, set } from 'lodash';
import { Subscription, EMPTY } from 'rxjs';
import { filter, catchError } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { ApiService, AgencyService, NavigationService, SchemaService, UserService } from 'shared';

@Component({
  templateUrl: './base-demographics.component.html',
  styleUrls: ['./base-demographics.component.scss'],
})
export class BaseDemographicsComponent {
  section: string = '';
  sectionSchemaPath: string = '';
  sectionSchemaRootElementName: string = '';
  sectionColumns: any[] = [];

  sectionHeader: string = '';
  sectionSchema: any;
  sectionData: any;

  routerSubscription?: Subscription;
  record: any;
  isEditing = false;
  isNewRecord = false;
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
      this.subscribeToRouteParams();
    });
    (this.api.demographics as any)[this.section].index().subscribe((response: HttpResponse<any>) => {
      this.sectionData = response.body || {};
      this.subscribeToRouteParams();
    });
  }

  handleRouteParams() {
    const id = this.route.snapshot.queryParams.id;
    const fragment = this.route.snapshot.fragment;
    /// if both id and fragment, replace with just id
    if (id && fragment) {
      return this.navigation.replaceWith(this.navigation.getCurrentPath(), {
        id,
      });
    }
    this.isEditing = (id || fragment) != null;
    this.isNewRecord = this.isEditing && fragment != null;
    if (this.isNewRecord) {
      this.record = this.newRecord();
    } else if (this.isEditing) {
      this.record = this.findRecord(id);
    } else {
      /// if this is not a grouped/multiple record section, set the data as the record
      if (!this.isGrouped) {
        this.record = this.data;
        this.isEditing = true;
        this.isNewRecord = false;
      } else {
        this.record = null;
      }
    }
  }

  newRecord() {
    return { _attributes: { UUID: uuid() } };
  }

  findRecord(id: string) {
    return find(this.data[this.groupElementName], {
      _attributes: { UUID: id } as any,
    });
  }

  subscribeToRouteParams() {
    if (this.sectionSchema && this.sectionData) {
      this.isLoading = false;
      /// handle route params in initial navigation to component
      this.handleRouteParams();
      /// subscribe for any internal navigation between query/fragment paths
      this.routerSubscription = this.navigation
        .getRouter()
        .events.pipe(filter((event: any) => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          const prevUrl = this.navigation.getPreviousUrl();
          if (prevUrl.endsWith('#new')) {
            this.sectionData = undefined;
            (this.api.demographics as any)[this.section].index().subscribe((response: HttpResponse<any>) => {
              this.sectionData = response.body || {};
            });
          }
          this.handleRouteParams();
        });
    }
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }

  get data(): any {
    this.sectionData[this.rootElementName] = this.sectionData[this.rootElementName] || {};
    return this.sectionData[this.rootElementName];
  }

  get rootElementName(): string {
    if (!this.sectionSchemaRootElementName) {
      this.sectionSchemaRootElementName = this.sectionSchema?.['xs:schema']?.['xs:complexType']?._attributes?.name;
    }
    return this.sectionSchemaRootElementName;
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

  onNew() {
    this.navigation.goTo(this.navigation.getCurrentUrl(), null, 'new');
  }

  onSelect(record: any) {
    const id = record._attributes?.UUID;
    if (id) {
      this.navigation.goTo(this.navigation.getCurrentUrl(), { id });
    }
  }

  onSubmit() {
    let request;
    if (this.isNewRecord) {
      request = (this.api.demographics as any)[this.section].create(this.record);
    } else {
      const id = this.record._attributes?.UUID;
      if (id) {
        request = (this.api.demographics as any)[this.section].update(id, this.record);
      } else {
        request = (this.api.demographics as any)[this.section].update(this.record);
      }
    }
    let url = this.navigation.getCurrentUrl();
    let index = url.indexOf('?');
    if (index >= 0) {
      url = url.substring(0, index);
    }
    index = url.indexOf('#');
    if (index >= 0) {
      url = url.substring(0, index);
    }
    this.isLoading = true;
    this.error = null;
    request
      .pipe(
        catchError((response: HttpErrorResponse) => {
          this.isLoading = false;
          this.error = response.error;
          window.scrollTo({ top: 0, behavior: 'smooth' });
          set(this.record, ['_attributes', 'pr:isValid'], false);
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.isLoading = false;
        set(this.record, ['_attributes', 'pr:isValid'], true);
        if (this.isNewRecord) {
          this.data[this.groupElementName].push(this.record);
        }
        this.navigation.backTo(url);
      });
  }
}
