import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';

import { AgencyService } from './agency.service';

@Injectable({
  providedIn: 'root',
})
export class AgencyGuard implements CanActivate, CanDeactivate<any> {
  constructor(private agency: AgencyService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    this.agency.connect();
    return of(true);
  }

  canDeactivate(
    component: any,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    this.agency.disconnect();
    return of(true);
  }
}
