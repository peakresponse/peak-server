import { HttpParams } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './list-forms-demographics.component.html',
})
export class ListFormsDemographicsComponent {
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
