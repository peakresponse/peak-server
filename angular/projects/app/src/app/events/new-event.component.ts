import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  onCreate(record: any) {
    this.navigation.backTo('/events');
  }

  onCreateVenue(record: any) {
    if (this.form) {
      this.form.record = { ...this.form.record, venueId: record.id };
    }
  }
}
