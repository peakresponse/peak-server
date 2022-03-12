import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

@Injectable()
export class AppService implements CanActivate {
  state: any = null;
  agency: any = null;

  constructor(private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): true | UrlTree {
    if (this.agency) {
      return true;
    }
    return this.router.parseUrl('/welcome');
  }
}
