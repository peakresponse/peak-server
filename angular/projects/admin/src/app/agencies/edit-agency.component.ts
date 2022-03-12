import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavigationService } from 'shared';

@Component({
  templateUrl: './edit-agency.component.html',
})
export class EditAgencyComponent {
  id: string = '';

  constructor(private navigation: NavigationService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
  }

  onDelete() {
    this.navigation.backTo(`/agencies`);
  }
}
