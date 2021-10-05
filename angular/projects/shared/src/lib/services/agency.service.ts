import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

import { Observable, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import { ApiService } from './api.service';

@Injectable()
export class AgencyService implements Resolve<any> {
  private agency: any = null;

  constructor(private api: ApiService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    if (this.agency) {
      return of(this.agency);
    }
    return this.api.agencies.me().pipe(
      catchError((error) => {
        this.agency = {};
        return of(this.agency);
      }),
      mergeMap((response) => {
        this.agency = response.body;
        return of(this.agency);
      })
    );
  }

  get id(): string | null {
    if (this.agency) {
      return this.agency.id;
    }
    return null;
  }

  get isValid(): boolean {
    if (this.agency) {
      return this.agency.isValid;
    }
    return false;
  }
}
