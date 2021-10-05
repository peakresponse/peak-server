import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavigationService } from 'shared';

@Component({
  templateUrl: './edit-user.component.html',
})
export class EditUserComponent {
  id: string | null = null;
  icon: any = null;

  constructor(private navigation: NavigationService, private route: ActivatedRoute) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
  }

  onIconRemove(record: any) {
    record.iconFile = null;
    this.icon = null;
  }

  onIconUploaded(record: any, upload: any) {
    record.iconFile = upload.href;
    this.icon = upload;
  }

  onDelete() {
    this.navigation.backTo(`/users`);
  }
}
