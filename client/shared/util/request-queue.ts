import { HttpResponse } from '@angular/common/http';
import { Observable, of, ReplaySubject, Subscription, throwError } from 'rxjs';
import { delay, mergeMap, retryWhen } from 'rxjs/operators';

class RequestQueueItem {
  public subject$ = new ReplaySubject<HttpResponse<any>>(1);
  constructor(public request: Observable<any>) {}
}

export class RequestQueue {
  private isPaused = false;
  private queue: RequestQueueItem[] = [];
  private subscription: Subscription = null;

  add(request: Observable<any>): Observable<any> {
    const item = new RequestQueueItem(request);
    this.queue.push(item);
    this.next();
    return item.subject$;
  }

  next() {
    if (!this.isPaused && this.subscription == null) {
      const item = this.queue.shift();
      if (item) {
        let retryDelay = 125;
        this.subscription = item.request
          .pipe(
            retryWhen((errors: Observable<any>) =>
              errors.pipe(
                mergeMap((error: any) => {
                  if (retryDelay < 2000) {
                    retryDelay *= 2;
                  }
                  return of(error).pipe(delay(retryDelay));
                })
              )
            )
          )
          .subscribe((response: HttpResponse<any>) => {
            // immediately start next request in queue, if any
            this.subscription = null;
            this.next();
            // send response to request handler and complete
            item.subject$.next(response);
            item.subject$.complete();
          });
      }
    }
  }
}
