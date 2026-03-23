import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavigationService } from 'shared';

@Component({
  templateUrl: './edit-employment.component.html',
  standalone: false,
})
export class EditEmploymentComponent {
  id: string | null = null;
  userId: string | null = null;

  constructor(
    private navigation: NavigationService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['employmentId'];
    this.userId = this.route.snapshot.params['id'];
  }

  onUpdate(employment: any) {
    this.navigation.replaceWith(`/users/${this.userId}`);
  }

  onDelete() {
    this.navigation.backTo(`/users/${this.userId}`);
  }
}
