import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavigationService } from 'shared';

@Component({
  templateUrl: './new-employment.component.html',
  standalone: false,
})
export class NewEmploymentComponent {
  userId: string | null = null;
  record: any = {
    createdByAgencyId: null,
    roles: [],
  };

  constructor(
    private navigation: NavigationService,
    private route: ActivatedRoute,
  ) {
    this.userId = this.route.snapshot.params['id'];
    console.log('?', this.userId);
  }

  transformRecord = (record: any) => ({
    ...record,
    userId: this.userId,
  });

  onCreate(employment: any) {
    this.navigation.replaceWith(`/users/${this.userId}`);
  }
}
