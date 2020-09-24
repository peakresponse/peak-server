import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import find from 'lodash/find';

import { ApiService, NavigationService } from '../../shared/services';

@Component({
  templateUrl: './new-facility.component.html',
})
export class NewFacilityComponent {
  constructor(
    private api: ApiService,
    private navigation: NavigationService,
    private route: ActivatedRoute
  ) {}

  onCreate(facility: any) {
    this.navigation.replaceWith(`/facilities/${facility.id}`);
  }
}
