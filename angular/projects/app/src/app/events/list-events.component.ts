import { Component } from '@angular/core';
import { UserService } from 'shared';

import { DateTime } from 'luxon';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';

import { Incident } from '../models/incident';
import models from '../models';

@Component({
  templateUrl: './list-events.component.html',
  styleUrls: ['./list-events.component.scss'],
  standalone: false,
})
export class ListEventsComponent {
  filter: string = 'current';
  search: string = '';
  params: HttpParams = new HttpParams();
  fragmentSubscription?: Subscription;

  constructor(
    public route: ActivatedRoute,
    public user: UserService,
  ) {
    const fragment = this.route.snapshot.fragment || 'current';
    this.onFragmentChanged(fragment);
    this.fragmentSubscription = this.route.fragment.subscribe((newFragment: string | null) => this.onFragmentChanged(newFragment));
  }

  transform(records: any): any[] {
    let data: any = {};
    for (const key of Object.keys(records)) {
      data[key] = {};
      for (const obj of records[key]) {
        data[key][obj.id] = obj;
      }
    }
    for (const dispatch of records.Dispatch) {
      const incident = data.Incident[dispatch.incidentId];
      incident.dispatchIds = incident.dispatchIds ?? [];
      incident.dispatchIds.push(dispatch.id);
    }
    return records.Incident.map((i: any) => new Incident(i, data, models));
  }

  onFragmentChanged(fragment: string | null) {
    if (fragment === 'current' || fragment === 'upcoming' || fragment === 'past') {
      this.filter = fragment;
      this.params = new HttpParams();
      if (this.filter === 'current') {
        // const vehicleId = this.user.currentAssignment?.vehicleId;
        // if (vehicleId) {
        //   this.params = this.params.set('vehicleId', vehicleId);
        // } else {
        //   this.filter = 'all';
        // }
      }
    }
  }

  cityName(name?: string): string {
    if (name && name.startsWith('City of ')) {
      name = name.substring(8);
    }
    return name ?? '';
  }

  parseDate(date: string): DateTime {
    return DateTime.fromISO(date);
  }

  datePart(datetime: DateTime): string {
    return datetime.toLocaleString(DateTime.DATE_FULL);
  }

  timePart(datetime: DateTime): string {
    return datetime.toLocaleString(DateTime.TIME_SIMPLE);
  }
}
