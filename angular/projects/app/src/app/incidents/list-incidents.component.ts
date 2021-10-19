import { Component } from '@angular/core';
import { UserService } from 'shared';

import { DateTime } from 'luxon';

@Component({
  templateUrl: './list-incidents.component.html',
  styleUrls: ['./list-incidents.component.scss'],
})
export class ListIncidentsComponent {
  search: string = '';

  constructor(public user: UserService) {}

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
