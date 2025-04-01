import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

import { Observable, of, EMPTY } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import { ApiService } from './api.service';

@Injectable()
export class SchemaService {
  private commonTypes: any = {};
  private schemaCache: any = {};

  constructor(private api: ApiService) {}

  getXsd(nemsisVersion: string, xsd: string): Observable<any> {
    let observable: Observable<any>;
    let commonTypes = this.commonTypes[nemsisVersion];
    if (commonTypes) {
      observable = of(commonTypes);
    } else {
      observable = this.api.get(`/nemsis/public/${nemsisVersion}/commonTypes_v3.xsd`).pipe(
        mergeMap((response: HttpResponse<any>) => {
          commonTypes = {};
          for (let simpleType of response.body['xs:schema']['xs:simpleType']) {
            commonTypes[simpleType._attributes.name] = simpleType;
          }
          this.commonTypes[nemsisVersion] = commonTypes;
          return of(commonTypes);
        }),
      );
    }
    observable = observable.pipe(
      catchError((error: any) => {
        console.log(error);
        return EMPTY;
      }),
      mergeMap((commonTypes: any) => {
        let schema = this.schemaCache[nemsisVersion]?.[xsd];
        if (schema) {
          return of(schema);
        }
        return this.api.get(`/nemsis/public/${nemsisVersion}/${xsd}`).pipe(
          mergeMap((response: HttpResponse<any>) => {
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
            this.schemaCache[nemsisVersion] ||= {};
            this.schemaCache[nemsisVersion][xsd] = schema;
            // look for and add any additional type definitions and add in...
            let simpleTypes = schema['xs:schema']['xs:simpleType'];
            if (simpleTypes) {
              if (!Array.isArray(simpleTypes)) {
                simpleTypes = [simpleTypes];
              }
              for (let simpleType of simpleTypes) {
                commonTypes[simpleType._attributes.name] = simpleType;
              }
            }
            return of(schema);
          }),
        );
      }),
    );
    return observable;
  }

  getCommonTypes(nemsisVersion: string): any {
    return this.commonTypes[nemsisVersion];
  }

  // following are deprecated and need to be replaced

  private deprecatedCommonTypes: any = {};
  private deprecatedSchemaCache: any = {};

  getType(name: string): any {
    if (this.deprecatedCommonTypes) {
      return this.deprecatedCommonTypes[name];
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
    if (this.deprecatedSchemaCache[schemaPath]) {
      return of(this.deprecatedSchemaCache[schemaPath]);
    }
    let observable: Observable<any>;
    if (this.deprecatedCommonTypes) {
      observable = of(this.deprecatedCommonTypes);
    } else {
      observable = this.api.get(`/nemsis/xsd/commonTypes_v3.json`).pipe(
        mergeMap((response: HttpResponse<any>) => {
          this.deprecatedCommonTypes = {};
          for (let simpleType of response.body['xs:schema']['xs:simpleType']) {
            this.deprecatedCommonTypes[simpleType._attributes.name] = simpleType;
          }
          return of(this.deprecatedCommonTypes);
        }),
      );
    }
    return observable.pipe(
      mergeMap(() => {
        return this.api.get(schemaPath).pipe(
          mergeMap((response: HttpResponse<any>) => {
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
            this.deprecatedSchemaCache[schemaPath] = schema;
            /// look for and add any additional type definitions and add in...
            let simpleTypes = schema['xs:schema']['xs:simpleType'];
            if (simpleTypes) {
              if (!Array.isArray(simpleTypes)) {
                simpleTypes = [simpleTypes];
              }
              for (let simpleType of simpleTypes) {
                this.deprecatedCommonTypes[simpleType._attributes.name] = simpleType;
              }
            }
            return of(schema);
          }),
        );
      }),
    );
  }
}
