import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';

import { Observable, of, EMPTY }  from 'rxjs';
import { catchError, mergeMap, take } from 'rxjs/operators';

import { ApiService } from './api.service';

@Injectable()
export class UserService implements Resolve<any> {
  private user: any = null;

  constructor(private api: ApiService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    if (this.user) {
      return of(this.user);
    }
    return this.api.users.me().pipe(
      catchError(error => {
        console.log(error);
        return EMPTY;
      }),
      mergeMap(response => {
        this.user = response.body;
        return of(this.user);
      })
    );
  }

  get id() {
    if (this.user) {
      return this.user.id;
    }
    return null;
  }

  get isAdmin() {
    if (this.user) {
      return this.user.isAdmin;
    }
    return false;
  }

  isPropertyAdmin(propertyId: string) {
    if (this.user) {
      if (this.user.isAdmin) {
        return true;
      }
      for (let membership of this.user.memberships) {
        if (membership.propertyId == propertyId) {
          return membership.isAdmin;
        }
      }
    }
    return false;
  }
}
