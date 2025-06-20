import { Component, OnInit } from '@angular/core';
import { ApiService, UserService } from 'shared';

import { DateTime } from 'luxon';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpParams, HttpResponse } from '@angular/common/http';

import { Incident } from '../models/incident';
import models from '../models';

@Component({
  templateUrl: './event-incidents.component.html',
  styleUrls: ['./event-incidents.component.scss'],
  standalone: false,
})
export class EventIncidentsComponent implements OnInit {
  id: string = '';
  filter: string = 'mine';
  search: string = '';
  params: HttpParams = new HttpParams();
  fragmentSubscription?: Subscription;

  record: any;

  constructor(
    public api: ApiService,
    public route: ActivatedRoute,
    public user: UserService,
  ) {
    const fragment = this.route.snapshot.fragment || 'mine';
    this.onFragmentChanged(fragment);
    this.fragmentSubscription = this.route.fragment.subscribe((newFragment: string | null) => this.onFragmentChanged(newFragment));
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.params = this.params.set('eventId', this.id);
      this.api.events.get(this.id).subscribe((response: HttpResponse<any>) => {
        this.record = response.body.Event;
      });
    });
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
    if (fragment === 'all' || fragment === 'mine') {
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
