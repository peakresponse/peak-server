import { Component } from '@angular/core';

import { AgencyService, NotificationService, UserService } from 'shared';

@Component({
  selector: 'admin-root',
  templateUrl: './app.component.html',
  standalone: false,
})
export class AppComponent {
  constructor(
    public currentAgency: AgencyService,
    public currentUser: UserService,
    public notification: NotificationService,
  ) {}
}
