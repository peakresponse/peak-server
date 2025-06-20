import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DateTime } from 'luxon';

import { FormComponent, NavigationService } from 'shared';

@Component({
  templateUrl: './new-event.component.html',
  standalone: false,
})
export class NewEventComponent {
  @ViewChild('form') form?: FormComponent;

  constructor(
    public route: ActivatedRoute,
    public navigation: NavigationService,
  ) {}

  onCancel() {
    this.navigation.backTo('/events');
  }

  transformRecord(record: any) {
    if (record.startTime) {
      record.startTime = DateTime.fromISO(record.startTime, { zone: 'local' }).toISO();
    }
    if (record.endTime) {
      record.endTime = DateTime.fromISO(record.endTime, { zone: 'local' }).toISO();
    }
    return record;
  }

  onCreate(record: any) {
    this.navigation.backTo('/events');
  }

  onCreateVenue(record: any) {
    if (this.form) {
      this.form.record = { ...this.form.record, venueId: record.id };
    }
  }
}
