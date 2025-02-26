import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavigationService } from 'shared';

@Component({
  templateUrl: './new-user.component.html',
  standalone: false,
})
export class NewUserComponent {
  id: string | null = null;

  constructor(
    private navigation: NavigationService,
    private route: ActivatedRoute,
  ) {}

  onCreate(user: any) {
    this.navigation.replaceWith(`/users/${user.id}`);
  }
}
