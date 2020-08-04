import { Component } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

import { AgencyService, UserService } from '../shared/services';

@Component({
  selector: 'app-admin',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(public currentAgency: AgencyService, public currentUser: UserService) {}
}
