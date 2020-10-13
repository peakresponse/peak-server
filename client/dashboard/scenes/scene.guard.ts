import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanDeactivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ApiService } from '../../shared/services/api.service';
import { SceneService } from './scene.service';

@Injectable()
export class SceneGuard implements CanActivate, CanActivateChild, CanDeactivate<any> {
  constructor(private api: ApiService, private router: Router, private scene: SceneService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    console.log('canActivate', route.params.id);
    return this.scene.connect(route.params.id);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const path = childRoute.url.join('');
    console.log('canActivateChild', path);
    if (path == '') {
      if (this.scene.isActive) {
        return of(this.router.parseUrl(`/scenes/${this.scene.id}/overview`));
      } else {
        return of(this.router.parseUrl(`/scenes/${this.scene.id}/summary`));
      }
    } else {
      if (this.scene.isActive && path == 'summary') {
        return of(this.router.parseUrl(`/scenes/${this.scene.id}/overview`));
      } else if (!this.scene.isActive && ['overview', 'patients', 'map'].includes(path)) {
        return of(this.router.parseUrl(`/scenes/${this.scene.id}/summary`));
      }
    }
    return of(true);
  }

  canDeactivate(
    component: any,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    console.log('canDeactivate', currentRoute.params.id);
    this.scene.disconnect();
    return of(true);
  }
}
