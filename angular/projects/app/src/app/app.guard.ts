import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AgencyService } from 'shared';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AppGuard {
  constructor(
    private router: Router,
    private agency: AgencyService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.agency.resolve(route, state).pipe(
      switchMap((agency: any) => {
        if (agency.isEventsOnly) {
          return of(this.router.parseUrl('/events'));
        }
        return of(this.router.parseUrl('/incidents'));
      }),
    );
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.canActivate(childRoute, state);
  }
}
