import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './dashboard-demographics.component.html',
})
export class DashboardDemographicsComponent implements OnInit {
  agency: any;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route?.parent?.data.subscribe((data: any) => (this.agency = data?.agency));
  }
}
