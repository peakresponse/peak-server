import { Injectable, OnDestroy } from '@angular/core';
import { GeolocationService as NgGeolocationService } from '@ng-web-apis/geolocation';
import { Observable, ReplaySubject, Subscription } from 'rxjs';

@Injectable()
export class GeolocationService implements OnDestroy {
  private locationSubscription: Subscription;
  private positionSubject = new ReplaySubject<any>(1);

  get position$(): Observable<any> {
    return this.positionSubject;
  }

  constructor(private geolocation$: NgGeolocationService) {
    this.locationSubscription = this.geolocation$.subscribe((position: any) => {
      if (position) {
        this.positionSubject.next(position);
      }
    });
  }

  ngOnDestroy() {
    this.locationSubscription.unsubscribe();
  }
}
