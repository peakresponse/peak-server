import { Component } from '@angular/core';
import { AgencyService, UserService } from 'shared';

import { DateTime } from 'luxon';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';

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
    public agency: AgencyService,
  ) {
    const fragment = this.route.snapshot.fragment || 'current';
    this.onFragmentChanged(fragment);
    this.fragmentSubscription = this.route.fragment.subscribe((newFragment: string | null) => this.onFragmentChanged(newFragment));
  }

  onFragmentChanged(fragment: string | null) {
    if (fragment === 'current' || fragment === 'past') {
      this.filter = fragment;
      this.params = new HttpParams().set('filter', this.filter);
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
