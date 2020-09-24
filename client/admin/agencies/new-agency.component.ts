import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import find from 'lodash/find';

import { ApiService, NavigationService } from '../../shared/services';

@Component({
  templateUrl: './new-agency.component.html',
})
export class NewAgencyComponent {
  constructor(
    private api: ApiService,
    private navigation: NavigationService,
    private route: ActivatedRoute
  ) {}

  onCreate(facility: any) {
    this.navigation.replaceWith(`/agencies/${facility.id}`);
  }
}
