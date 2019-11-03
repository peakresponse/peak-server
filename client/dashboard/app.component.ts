import { Component } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

import { UserService } from '../shared/services';

@Component({
  selector: 'app-dashboard',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor(public currentUser: UserService) {}
}
