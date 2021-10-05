import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

import { Observable, of, EMPTY, ReplaySubject } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import { ApiService } from './api.service';
import { remove } from 'lodash';

@Injectable()
export class UserService implements Resolve<any> {
  private user: any = null;
  private userSubject = new ReplaySubject<any>(1);
  get attributes$(): Observable<any> {
    return this.userSubject;
  }

  private agency: any = null;
  private agencySubject = new ReplaySubject<any>(1);
  get agency$(): Observable<any> {
    return this.agencySubject;
  }

  private employment: any = null;
  private employmentSubject = new ReplaySubject<any>(1);
  get employment$(): Observable<any> {
    return this.employmentSubject;
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

  hasRole(role: string) {
    if (this.user?.isAdmin || this.employment?.isOwner) {
      return true;
    }
    return this.employment?.roles?.includes(role) ?? false;
  }

  leaveScene(id: string) {
    if (this.user?.activeScenes) {
      remove(this.user.activeScenes, { id });
    }
  }

  constructor(private api: ApiService) {
    this.api.users
      .me()
      .pipe(
        catchError((error) => {
          console.log(error);
          return EMPTY;
        })
      )
      .subscribe((response) => {
        this.user = response.body.user;
        this.agency = response.body.agency;
        this.employment = response.body.employment;
        this.userSubject.next(this.user);
        this.agencySubject.next(this.agency);
        this.employmentSubject.next(this.employmentSubject);
      });
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    if (this.user) {
      return of(this.user);
    }
    return this.api.users.me().pipe(
      catchError((error) => {
        console.log(error);
        return EMPTY;
      }),
      mergeMap((response) => {
        this.user = response.body.user;
        this.agency = response.body.agency;
        this.employment = response.body.employment;
        return of(this.user);
      })
    );
  }
}
