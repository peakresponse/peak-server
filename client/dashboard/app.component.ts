import { Component } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

import { UserService } from '../shared/services';

@Component({
  selector: 'app-dashboard',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public currentUser: UserService) {}
}
