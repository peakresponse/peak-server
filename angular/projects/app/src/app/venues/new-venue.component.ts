import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DateTime } from 'luxon';

import { FormComponent, NavigationService } from 'shared';

@Component({
  templateUrl: './new-venue.component.html',
  standalone: false,
})
export class NewVenueComponent {
  @ViewChild('form') form?: FormComponent;

  constructor(
    public route: ActivatedRoute,
    public navigation: NavigationService,
  ) {}

  onCancel() {
    this.navigation.backTo('/venues');
  }

  onCreate(record: any) {
    this.navigation.goTo(`/venues/${record.id}`);
  }
}
