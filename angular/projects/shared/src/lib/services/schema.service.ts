import { Injectable } from '@angular/core';

import { Observable, of, EMPTY } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import { ApiService } from './api.service';

@Injectable()
export class SchemaService {
  private nemsisVersion?: string;
  private commonTypes: any = null;
  private schemaCache: any = {};

  private draftNemsisVersion?: string;
  private draftCommonTypes: any = null;
  private draftSchemaCache: any = {};

  constructor(private api: ApiService) {}

  getXsd(isDraft: boolean, nemsisVersion: string, xsd: string): Observable<any> {
    if (isDraft && this.draftNemsisVersion !== nemsisVersion) {
      this.draftCommonTypes = null;
      this.draftSchemaCache = {};
      this.draftNemsisVersion = nemsisVersion;
    } else if (!isDraft && this.nemsisVersion !== nemsisVersion) {
      this.commonTypes = null;
      this.schemaCache = {};
      this.nemsisVersion = nemsisVersion;
    }
    if (isDraft && this.draftNemsisVersion === this.nemsisVersion) {
      isDraft = false;
    }
    let observable: Observable<any>;
    let commonTypes = isDraft ? this.draftCommonTypes : this.commonTypes;
    if (commonTypes) {
      observable = of(commonTypes);
    } else {
      observable = this.api.get(`/nemsis/public/${nemsisVersion}/commonTypes_v3.xsd`).pipe(
        mergeMap((response) => {
          commonTypes = {};
          for (let simpleType of response.body['xs:schema']['xs:simpleType']) {
            commonTypes[simpleType._attributes.name] = simpleType;
          }
          if (isDraft) {
            this.draftCommonTypes = commonTypes;
          } else {
            this.commonTypes = commonTypes;
          }
          return of(commonTypes);
        })
      );
    }
    observable = observable.pipe(
      catchError((error) => {
        console.log(error);
        return EMPTY;
      }),
      mergeMap(() => {
        let schema = isDraft ? this.draftSchemaCache[xsd] : this.schemaCache[xsd];
        if (schema) {
          return of(schema);
        }
        return this.api.get(`/nemsis/public/${nemsisVersion}/${xsd}`).pipe(
          mergeMap((response) => {
            // normalize schema response structure a bit
            schema = response.body;
            let complexTypes = schema['xs:schema']['xs:complexType'];
            if (!Array.isArray(complexTypes)) {
              complexTypes = [complexTypes];
            }
            for (let complexType of complexTypes) {
              if (!Array.isArray(complexType['xs:sequence']['xs:element'])) {
                complexType['xs:sequence']['xs:element'] = [complexType['xs:sequence']['xs:element']];
              }
            }
            if (isDraft) {
              this.draftSchemaCache[xsd] = schema;
            } else {
              this.schemaCache[xsd] = schema;
            }
            // look for and add any additional type definitions and add in...
            let simpleTypes = schema['xs:schema']['xs:simpleType'];
            if (simpleTypes) {
              if (!Array.isArray(simpleTypes)) {
                simpleTypes = [simpleTypes];
              }
              for (let simpleType of simpleTypes) {
                (isDraft ? this.draftCommonTypes : this.commonTypes)[simpleType._attributes.name] = simpleType;
              }
            }
            return of(schema);
          })
        );
      })
    );
    return observable;
  }

  getCommonTypes(isDraft: boolean): any {
    return isDraft ? this.draftCommonTypes : this.commonTypes;
  }

  getType(name: string): any {
    if (this.commonTypes) {
      return this.commonTypes[name];
    }
    return null;
  }

  getEnum(name: string): any | null {
    const type = this.getType(name);
    if (type && type['xs:restriction']?.['xs:enumeration']) {
      return type['xs:restriction']['xs:enumeration'].reduce((current: any, t: any) => {
        const key = t._attributes?.value;
        const value = t['xs:annotation']?.['xs:documentation']?._text;
        if (key && value) {
          current[key] = value;
        }
        return current;
      }, {});
    }
    return null;
  }

  get(schemaPath: string): Observable<any> {
    if (this.schemaCache[schemaPath]) {
      return of(this.schemaCache[schemaPath]);
    }
    let observable: Observable<any>;
    if (this.commonTypes) {
      observable = of(this.commonTypes);
    } else {
      observable = this.api.get(`/nemsis/xsd/commonTypes_v3.json`).pipe(
        mergeMap((response) => {
          this.commonTypes = {};
          for (let simpleType of response.body['xs:schema']['xs:simpleType']) {
            this.commonTypes[simpleType._attributes.name] = simpleType;
          }
          return of(this.commonTypes);
        })
      );
    }
    return observable.pipe(
      mergeMap(() => {
        return this.api.get(schemaPath).pipe(
          mergeMap((response) => {
            /// normalize schema response structure a bit
            const schema = response.body;
            let complexTypes = schema['xs:schema']['xs:complexType'];
            if (!Array.isArray(complexTypes)) {
              complexTypes = [complexTypes];
            }
            for (let complexType of complexTypes) {
              if (!Array.isArray(complexType['xs:sequence']['xs:element'])) {
                complexType['xs:sequence']['xs:element'] = [complexType['xs:sequence']['xs:element']];
              }
            }
            this.schemaCache[schemaPath] = schema;
            /// look for and add any additional type definitions and add in...
            let simpleTypes = schema['xs:schema']['xs:simpleType'];
            if (simpleTypes) {
              if (!Array.isArray(simpleTypes)) {
                simpleTypes = [simpleTypes];
              }
              for (let simpleType of simpleTypes) {
                this.commonTypes[simpleType._attributes.name] = simpleType;
              }
            }
            return of(schema);
          })
        );
      })
    );
  }
}
