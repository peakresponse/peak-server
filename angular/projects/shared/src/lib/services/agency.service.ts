import { Injectable } from '@angular/core';
import { RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { HttpResponse } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import { ApiService } from './api.service';

@Injectable()
export class AgencyService {
  private agency: any = null;

  constructor(private api: ApiService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    if (this.agency) {
      return of(this.agency);
    }
    return this.fetch();
  }

  fetch(): Observable<any> {
    return this.api.agencies.me().pipe(
      catchError(() => {
        this.agency = {};
        return of(this.agency);
      }),
      mergeMap((response: HttpResponse<any>) => {
        this.agency = response.body;
        return of(this.agency);
      }),
    );
  }

  refresh() {
    this.fetch().subscribe();
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

  get version(): any {
    return this.agency?.version;
  }

  get draftVersion(): any {
    return this.agency?.draftVersion;
  }
}
