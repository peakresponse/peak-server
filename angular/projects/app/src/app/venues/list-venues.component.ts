import { Component } from '@angular/core';
import { AgencyService, UserService } from 'shared';

import { DateTime } from 'luxon';
import { ActivatedRoute } from '@angular/router';

import { Venue } from '../models/venue';
import models from '../models';

@Component({
  templateUrl: './list-venues.component.html',
  styleUrls: ['./list-venues.component.scss'],
  standalone: false,
})
export class ListVenuesComponent {
  search: string = '';

  constructor(
    public route: ActivatedRoute,
    public user: UserService,
    public agency: AgencyService,
  ) {}

  transform(records: any): any[] {
    let data: any = {};
    for (const key of Object.keys(records)) {
      data[key] = {};
      for (const obj of records[key]) {
        data[key][obj.id] = obj;
      }
    }
    return records.Venue.map((e: any) => new Venue(e, data, models));
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
