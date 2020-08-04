import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ApiService } from '../shared/services';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root',
})
export class AppGuard implements CanActivate {
  constructor(private api: ApiService, private app: AppService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean|UrlTree> {
    return this.api.agencies.me()
      .pipe(
        catchError(err => of(err)),
        map((res: HttpResponse<any>) => {
          if (res.status == 404) {
            return this.router.parseUrl('/welcome');
          }
          this.app.agency = res.body;
          return true;
        })
      );
  }
}
