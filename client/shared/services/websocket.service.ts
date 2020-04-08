import { Injectable, OnDestroy, isDevMode } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map, retryWhen, switchMap, tap } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable()
export class WebSocketService implements OnDestroy {
  RETRY_SECONDS = 10;

  connection$: WebSocketSubject<any>;
  isConnected = false;

  constructor() {}

  connect(): Observable<any> {
    return of(window.location.origin).pipe(
      map(url => url.replace(/^http/, 'ws')),
      switchMap(url => {
        if (!this.connection$) {
          this.connection$ = webSocket(url);
        }
        return this.connection$;
      }),
      retryWhen(errors => errors.pipe(
        tap(err => this.isConnected = false),
        delay(this.RETRY_SECONDS)
      ))
    );
  }

  close() {
    if (this.connection$) {
      this.connection$.complete();
      this.connection$ = null;
    }
  }

  ngOnDestroy() {
    this.close();
  }
}
