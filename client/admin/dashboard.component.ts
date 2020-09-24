import { Component } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  constructor(public route: ActivatedRoute) {}
}
