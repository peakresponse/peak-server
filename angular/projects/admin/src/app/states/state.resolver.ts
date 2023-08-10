import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { HttpResponse } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

import { ApiService } from 'shared';

@Injectable()
export class StateResolver implements Resolve<any> {
  private state: any = null;

  constructor(private api: ApiService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const id = route.params['id'];
    if (this.state?.id === id) {
      return of(this.state);
    }
    return this.fetch(id);
  }

  fetch(id: string): Observable<any> {
    return this.api.states.get(id).pipe(
      catchError(() => {
        this.state = {};
        return of(this.state);
      }),
      mergeMap((response: HttpResponse<any>) => {
        this.state = response.body;
        return of(this.state);
      })
    );
  }
}
