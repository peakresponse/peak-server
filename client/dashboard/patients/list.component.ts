import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute, Params, ParamMap } from '@angular/router';
import { AgmMap, LatLngBounds } from '@agm/core';
import { Subscription } from 'rxjs';
import assign from 'lodash/assign';
import find from 'lodash/find';
import orderBy from 'lodash/orderBy';
import filter from 'lodash/filter';
import size from 'lodash/size';

import { Patient } from './patient';
import { WebSocketService } from '../../shared/services';

declare var google: any;

@Component({
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListPatientsComponent implements AfterViewInit, OnDestroy {
  PRIORITY_ARRAY = Patient.PRIORITY_ARRAY;
  SORT_ARRAY = [
    'recent',
    'longest',
    'az',
    'za',
  ];
  SORT_LABELS = {
    recent: 'Recently Updated',
    longest: 'Longest Since Update',
    az: 'A-Z by Last Name',
    za: 'Z-A by Last Name',
  };
  sort = 'recent';
  view = 'sorted';
  tab = 'immediate';
  records: any[] = [];
  subscription: Subscription;
  now: Date;
  interval: any;
  mapHeight = 0;
  mapInitialized = false;
  @ViewChild('map') map: AgmMap;
  @ViewChild('mapContainer') mapContainer: ElementRef;
  @ViewChild('navbar') navbar: ElementRef;

  constructor(public route: ActivatedRoute, private ws: WebSocketService) {
    this.route.paramMap
      .subscribe((params: ParamMap) => {
        this.view = params.get('view');
        if (this.view == 'map') {
          this.recenterMap();
        }
      });
    this.route.queryParams
      .subscribe((params: Params) => {
        this.sort = params['sort'] || 'recent';
        this.resort();
      });
    this.route.fragment
      .subscribe((fragment: string) => this.tab = fragment || 'immediate');

    this.now = new Date();
    this.interval = setInterval(() => this.now = new Date(), 1000);
  }

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
      this.resort();
      if (recenter && this.mapInitialized) {
        this.recenterMap();
      }
    });
    setTimeout(() => this.onResize(), 0);
  }

  resort() {
    switch (this.sort) {
    case 'recent':
      this.records = orderBy(this.records, ['priority', 'updatedAt'], ['asc', 'desc']);
      break;
    case 'longest':
      this.records = orderBy(this.records, ['priority', 'updatedAt'], ['asc', 'asc']);
      break;
    case 'az':
      this.records = orderBy(this.records, ['priority', 'lastName'], ['asc', 'asc']);
      break;
    case 'za':
      this.records = orderBy(this.records, ['priority', 'lastName'], ['asc', 'desc']);
      break;
    }
  }

  recenterMap() {
    if (window['google']) {
      const bounds: LatLngBounds = new window['google'].maps.LatLngBounds();
      for (let record of this.records) {
        if (record.lat && record.lng) {
          bounds.extend(new window['google'].maps.LatLng(record.lat, record.lng));
        }
      }
      this.map.fitBounds = bounds;
      this.map.triggerResize();
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  @HostListener('window:resize')
  onResize() {
   this.mapHeight = window.innerHeight - this.navbar.nativeElement.offsetHeight;
  }

  trackById(record: any, index: number): string {
    return record.id;
  }

  priorityCount(priority: string): number {
    const index = this.PRIORITY_ARRAY.indexOf(priority);
    return size(filter(this.records, r => r.priority == index));
  }

  priorityMatch(record: any): boolean {
    return record.priority == Patient.PRIORITY_MAP[this.tab];
  }
}
