import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService, NavigationService } from 'shared';

@Component({
  templateUrl: './new-agency.component.html',
})
export class NewAgencyComponent {
  states: any = [];

  constructor(private api: ApiService, private navigation: NavigationService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.api.states.index().subscribe((res: any) => (this.states = res.body));
  }

  onCreate(agency: any) {
    this.navigation.replaceWith(`/agencies/${agency.id}`);
  }
}
