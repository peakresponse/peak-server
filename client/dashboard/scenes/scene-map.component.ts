import { AfterViewInit, Component, ViewChild } from '@angular/core';

import { AgmMap, LatLngBounds } from '@agm/core';

import { SceneService } from './scene.service';
import { Patient } from './patients';

@Component({
  templateUrl: './scene-map.component.html',
  styleUrls: ['./scene-map.component.scss']
})
export class SceneMapComponent implements AfterViewInit {
  @ViewChild('map') private map: AgmMap;

  constructor(public scene: SceneService) {}

  ngAfterViewInit() {
    this.map.mapReady.subscribe(() => {
      this.recenterMap()
    });
  }

  recenterMap() {
    if (window['google']) {
      const bounds: LatLngBounds = new window['google'].maps.LatLngBounds();
      for (let patient of this.scene.patients) {
        if (patient.lat && patient.lng) {
          bounds.extend(new window['google'].maps.LatLng(patient.lat, patient.lng));
        }
      }
      this.map.fitBounds = bounds;
      this.map.triggerResize();
    }
  }

  trackById(patient: any, index: number): string {
    return patient.id;
  }

  pinUrl(patient: any) {
    return `/images/${Patient.PRIORITIES[patient.priority]}.png`;
  }
}
