import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { UserService } from 'shared';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserGuard {
  constructor(
    private router: Router,
    private user: UserService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.user.assignment$.pipe(
      switchMap((assignment: any) => {
        if (!assignment) {
          return of(this.router.parseUrl('/assignments'));
        }
        // if (user.activeScenes?.length > 0) {
        //   const sceneId = user.activeScenes[0].id;
        //   if (route.pathFromRoot.length > 2) {
        //     if (route.pathFromRoot[1].url.toString() == 'scenes' && route.pathFromRoot[2].url.toString() == sceneId) {
        //       return of(true);
        //     }
        //   }
        //   return of(this.router.parseUrl(`/scenes/${sceneId}`));
        // }
        return of(true);
      }),
    );
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.canActivate(childRoute, state);
  }
}
