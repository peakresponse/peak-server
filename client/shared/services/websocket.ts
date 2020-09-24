import { Observable, of } from 'rxjs';
import { delay, map, retryWhen, switchMap } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

export class WebSocket {
  RETRY_SECONDS = 10;

  path: string = null;
  connection$: WebSocketSubject<any>;

  constructor(path: string) {
    this.path = path;
  }

  connect(): Observable<any> {
    return of(window.location.origin).pipe(
      map((url) => `${url.replace(/^http/, 'ws')}${this.path}`),
      switchMap((url) => {
        if (!this.connection$) {
          this.connection$ = webSocket(url);
        }
        return this.connection$;
      }),
      retryWhen((errors) => errors.pipe(delay(this.RETRY_SECONDS)))
    );
  }

  close() {
    if (this.connection$) {
      this.connection$.complete();
      this.connection$ = null;
    }
  }
}
