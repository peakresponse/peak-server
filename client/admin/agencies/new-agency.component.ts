import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import find from 'lodash/find';

import { ApiService, NavigationService } from '../../shared/services';

@Component({
  templateUrl: './new-agency.component.html',
})
export class NewAgencyComponent {
  states: any = [];

  constructor(private api: ApiService, private navigation: NavigationService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.api.states.index().subscribe((res) => (this.states = res.body));
  }

  onCreate(facility: any) {
    this.navigation.replaceWith(`/agencies/${facility.id}`);
  }
}
