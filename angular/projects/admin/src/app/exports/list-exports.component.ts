import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpParams } from '@angular/common/http';

@Component({
  templateUrl: './list-exports.component.html',
})
export class ListExportsComponent {
  params = new HttpParams({ fromObject: { showAll: true } });

  constructor(public route: ActivatedRoute) {}
}
