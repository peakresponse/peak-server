import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { AgmMap, LatLngBounds } from '@agm/core';
import { Subscription } from 'rxjs';
import assign from 'lodash/assign';
import find from 'lodash/find';
import sortBy from 'lodash/sortBy';

import { WebSocketService } from '../../shared/services';

declare var google: any;

@Component({
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListPatientsComponent implements AfterViewInit, OnDestroy {
  records: any[] = [];
  subscription: Subscription;
  mapHeight = 0;
  mapInitialized = false;
  @ViewChild('map') map: AgmMap;
  @ViewChild('mapContainer') mapContainer: ElementRef;

  constructor(public route: ActivatedRoute, private ws: WebSocketService) {}

  ngAfterViewInit() {
    this.map.mapReady.subscribe(() => {
      this.mapInitialized = true;
      this.recenterMap()
    });
    this.subscription = this.ws.connect().subscribe(records => {
      const recenter = this.records.length == 0;
      for (let record of records) {
        const found = find(this.records, {id: record.id});
        if (!found) {
          this.records.push(record);
        } else {
          assign(found, record);
        }
      }
      this.records = sortBy(this.records, ['priority', 'updated_at']);
      if (recenter && this.mapInitialized) {
        this.recenterMap();
      }
    });
    setTimeout(() => this.onResize(), 0);
  }

  recenterMap() {
    const bounds: LatLngBounds = new window['google'].maps.LatLngBounds();
    for (let record of this.records) {
      if (record.lat && record.lng) {
        bounds.extend(new window['google'].maps.LatLng(record.lat, record.lng));
      }
    }
    this.map.fitBounds = bounds;
    this.map.triggerResize();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  @HostListener('window:resize')
  onResize(){
   this.mapHeight = this.mapContainer.nativeElement.offsetWidth;
  }

  trackById(record: any, index: number): string {
    return record.id;
  }
}
