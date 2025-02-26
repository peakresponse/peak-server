import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './list-versions-demographics.component.html',
  standalone: false,
})
export class ListVersionsDemographicsComponent {
  data = {
    filter: 'active',
  };
  search: string = '';
  params: HttpParams = new HttpParams({ fromObject: this.data });

  constructor(public route: ActivatedRoute) {}

  updateParams() {
    this.params = new HttpParams({ fromObject: this.data });
  }
}
