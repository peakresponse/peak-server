import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, CanActivateChild, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from 'shared';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AppGuard implements CanActivate {
  constructor(private router: Router, private user: UserService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.user.attributes$.pipe(
      switchMap((user: any) => {
        if (user.isAdmin) {
          return of(this.router.parseUrl('/users'));
        } else {
          return of(this.router.parseUrl('/demographics/personnel'));
        }
      })
    );
  }
}
