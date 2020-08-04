import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanDeactivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { Observable, of }  from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ApiService } from '../../shared/services/api.service';
import { SceneService } from './scene.service';

@Injectable()
export class SceneGuard implements CanActivate, CanActivateChild, CanDeactivate<any> {
  constructor(private api: ApiService, private router: Router, private scene: SceneService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean|UrlTree> {
    return this.scene.load(route.params.id)
      .pipe(
        map(() => true)
      );
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean|UrlTree> {
    const path = childRoute.url.join('');
    console.log('canActivateChild', path);
    if (path == '') {
      if (this.scene.isActive) {
        return of(this.router.parseUrl(`/scenes/${this.scene.id}/overview`));
      }
    } else {
      if (!this.scene.isActive) {
        return of(this.router.parseUrl(`/scenes/${this.scene.id}`));
      }
    }
    return of(true);
  }

  canDeactivate(component: any, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): Observable<boolean|UrlTree> {
    console.log('canDeactivate');
    return of(true);
  }
}
