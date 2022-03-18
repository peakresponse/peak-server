import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ApiService, NavigationService } from 'shared';

@Component({
  templateUrl: './edit-agency.component.html',
})
export class EditAgencyComponent {
  id: string = '';
  states: any = [];

  constructor(private api: ApiService, private navigation: NavigationService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.api.states.index().subscribe((res: any) => (this.states = res.body));
  }

  onDelete() {
    this.navigation.backTo(`/agencies`);
  }
}
