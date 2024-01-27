import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { AgencyService, ApiService, NotificationService, UserService } from 'shared';

@Component({
  selector: 'guides-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  guides: any;

  constructor(
    private api: ApiService,
    public currentAgency: AgencyService,
    public currentUser: UserService,
    public notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.api.guides.index().subscribe((response: HttpResponse<any>) => (this.guides = response.body));
  }
}
