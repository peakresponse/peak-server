import { Component } from '@angular/core';

import { AgencyService, NotificationService, UserService } from 'shared';

@Component({
  selector: 'guides-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    public currentAgency: AgencyService,
    public currentUser: UserService,
    public notification: NotificationService,
  ) {}
}
