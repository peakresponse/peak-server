import { Component } from '@angular/core';
import { HttpParams } from '@angular/common/http';

import { AgencyService } from '../agencies/agency.service';

@Component({
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.scss'],
})
export class ListUsersComponent {
  currentParams = new HttpParams().set('isPending', '0');
  pendingParams = new HttpParams().set('isPending', '1');

  constructor(public agency: AgencyService) {}
}
