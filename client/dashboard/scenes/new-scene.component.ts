import { Component, AfterViewInit } from '@angular/core';
import { GeolocationService } from '@ng-web-apis/geolocation';

import { ApiService, NavigationService } from '../../shared/services';
import { take } from 'rxjs/operators';

@Component({
  templateUrl: './new-scene.component.html',
  styleUrls: ['./new-scene.component.scss'],
})
export class NewSceneComponent implements AfterViewInit {
  data: any = {};

  constructor(
    private api: ApiService,
    private geolocation$: GeolocationService,
    private navigation: NavigationService
  ) {}

  ngAfterViewInit() {
    this.geolocation$.pipe(take(1)).subscribe((position: any) => {
      this.data.lat = position.coords.latitude;
      this.data.lng = position.coords.longitude;
      this.api.utils
        .geocode(this.data.lat, this.data.lng)
        .subscribe((response) => {
          this.data.city = response.body?.city;
          this.data.state = response.body?.state;
          this.data.zip = response.body?.zip;
        });
    });
  }

  onCancel() {
    this.navigation.backTo('/scenes');
  }

  onCreate(data: any) {
    this.navigation.replaceWith(`/scenes/${data.id}`);
  }
}
