import { Component, AfterViewInit } from '@angular/core';
import { take } from 'rxjs/operators';

import { ApiService, GeolocationService, NavigationService } from '../../shared/services';
import { SceneService } from './scene.service';

@Component({
  templateUrl: './new-scene.component.html',
  styleUrls: ['./new-scene.component.scss'],
})
export class NewSceneComponent implements AfterViewInit {
  data: any = {};

  constructor(
    private api: ApiService,
    private geolocation: GeolocationService,
    private navigation: NavigationService,
    private scene: SceneService
  ) {}

  ngAfterViewInit() {
    this.geolocation.position$.pipe(take(1)).subscribe((position: any) => {
      this.data.lat = position.coords.latitude;
      this.data.lng = position.coords.longitude;
      this.api.utils.geocode(this.data.lat, this.data.lng).subscribe((response) => {
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
    if (!data.lat || !data.lng) {
      this.scene.captureLocation(data.id);
    }
    this.navigation.replaceWith(`/scenes/${data.id}`);
  }
}
