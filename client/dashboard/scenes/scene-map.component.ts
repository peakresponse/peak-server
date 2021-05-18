import { AfterViewInit, Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { AgmMap, LatLngBounds } from '@agm/core';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import uuid from 'uuid';

import { GeolocationService, UserService } from '../../shared/services';
import { SceneService } from './scene.service';
import { Patient } from './patients';

@Component({
  templateUrl: './scene-map.component.html',
  styleUrls: ['./scene-map.component.scss'],
})
export class SceneMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('map') private map: AgmMap;

  scale: number;
  transform: string;
  width: string;
  height: string;

  private locationSubscription: Subscription;
  location: any = null;

  newPin: any = null;
  selectedPin: any = null;
  isEditingSelectedPin = false;

  constructor(private geolocation: GeolocationService, public scene: SceneService, public user: UserService) {}

  ngAfterViewInit() {
    this.map.mapReady.subscribe(() => {
      this.onWindowResize();
      this.recenterMap();
      this.locationSubscription = this.geolocation.position$.subscribe((position: any) => this.updateLocation(position));
    });
  }

  ngOnDestroy() {
    this.locationSubscription?.unsubscribe();
  }

  @HostListener('window:resize')
  private onWindowResize() {
    this.scale = Math.max(1, 1792 / window.innerWidth);
    this.transform = `scale(${this.scale})`;
    this.width = `${(window.innerWidth * this.scale - 128) / this.scale}px`;
    this.height = `${(window.innerHeight * this.scale - 128) / this.scale}px`;
  }

  recenterMap() {
    if (window['google']) {
      this.scene.patients$.pipe(take(1)).subscribe((patients: any) => {
        let found = false;
        const bounds: LatLngBounds = new window['google'].maps.LatLngBounds();
        for (let patient of patients) {
          if (patient.lat && patient.lng) {
            found = true;
            bounds.extend(new window['google'].maps.LatLng(patient.lat, patient.lng));
          }
        }
        if (found) {
          this.map.fitBounds = bounds;
        } else if (this.scene.attributes.lat && this.scene.attributes.lng) {
          this.map.fitBounds = null;
          this.map.latitude = parseFloat(this.scene.attributes.lat);
          this.map.longitude = parseFloat(this.scene.attributes.lng);
        }
        this.map.triggerResize();
      });
    }
  }

  updateLocation(position: any) {
    this.location = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
  }

  trackById(patient: any, index: number): string {
    return patient.id;
  }

  pinUrl(patient: any) {
    return `/images/map/${Patient.PRIORITIES[patient.filterPriority]}.png`;
  }

  onMapClick(event: any) {
    if (this.selectedPin) {
      this.selectedPin = null;
    } else {
      this.newPin = this.newPin || {
        id: uuid.v4(),
      };
      this.newPin.lat = event.coords.lat;
      this.newPin.lng = event.coords.lng;
    }
  }

  onNewPinSetType(type: string) {
    this.newPin.type = type;
    if (type !== 'OTHER') {
      delete this.newPin.name;
    }
  }

  onNewPinSubmit() {
    let pin = this.newPin;
    this.newPin = null;
    this.scene.addPin(pin).subscribe();
  }

  onNewPinCancel() {
    this.newPin = null;
  }

  get isNewPinValid() {
    return this.newPin.type && (this.newPin.type !== 'OTHER' || this.newPin.name);
  }

  onSelectedPinEdit() {
    this.isEditingSelectedPin = true;
  }

  onSelectedPinTrash() {
    this.scene.removePin(this.selectedPin).subscribe();
    this.selectedPin = null;
  }

  onSelectedPinCancel() {
    this.isEditingSelectedPin = false;
  }
}
