import { Component } from '@angular/core';
import { UserService } from 'shared';

import { DateTime } from 'luxon';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';

@Component({
  templateUrl: './list-incidents.component.html',
  styleUrls: ['./list-incidents.component.scss'],
})
export class ListIncidentsComponent {
  filter: string = 'mine';
  search: string = '';
  params: HttpParams = new HttpParams();
  fragmentSubscription?: Subscription;

  constructor(public route: ActivatedRoute, public user: UserService) {
    const fragment = this.route.snapshot.fragment || 'mine';
    this.onFragmentChanged(fragment);
    this.fragmentSubscription = this.route.fragment.subscribe((newFragment: string | null) => this.onFragmentChanged(newFragment));
  }

  onFragmentChanged(fragment: string | null) {
    if (fragment === 'all' || fragment === 'mine') {
      this.filter = fragment;
      this.params = new HttpParams();
      if (this.filter === 'mine') {
        const vehicleId = this.user.currentAssignment?.vehicleId;
        if (vehicleId) {
          this.params = this.params.set('vehicleId', vehicleId);
        } else {
          this.filter = 'all';
        }
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
