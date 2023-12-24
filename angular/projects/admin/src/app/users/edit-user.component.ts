import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { v4 as uuid } from 'uuid';

import { NavigationService } from 'shared';

@Component({
  templateUrl: './edit-user.component.html',
})
export class EditUserComponent {
  id: string = '';

  constructor(
    private navigation: NavigationService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
  }

  onDelete() {
    this.navigation.backTo(`/users`);
  }

  onGenerate(record: any) {
    record.apiKey = uuid();
  }
}
