import { Injectable } from '@angular/core';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

import { Observable, of, EMPTY } from 'rxjs';
import { catchError, mergeMap, take } from 'rxjs/operators';

import { ApiService } from './api.service';

@Injectable()
export class SchemaService implements Resolve<any> {
  private commonTypes: any = null;
  private schemaCache: any = {};

  constructor(private api: ApiService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    if (this.commonTypes) {
      return of(this.commonTypes);
    }
    return this.api.get('/nemsis/xsd/commonTypes_v3.json').pipe(
      catchError((error) => {
        console.log(error);
        return EMPTY;
      }),
      mergeMap((response) => {
        const commonTypes = {};
        for (let simpleType of response.body['xs:schema']['xs:simpleType']) {
          commonTypes[simpleType._attributes.name] = simpleType;
        }
        this.commonTypes = commonTypes;
        return of(this.commonTypes);
      })
    );
  }

  getType(name: string): any {
    if (this.commonTypes) {
      return this.commonTypes[name];
    }
    return null;
  }

  get(schemaPath: string): Observable<any> {
    if (this.schemaCache[schemaPath]) {
      return of(this.schemaCache[schemaPath]);
    }
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
  }
}
