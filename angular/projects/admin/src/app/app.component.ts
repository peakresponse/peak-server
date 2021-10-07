import { Component } from '@angular/core';

import { AgencyService, UserService } from 'shared';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public currentAgency: AgencyService, public currentUser: UserService) {}
}
